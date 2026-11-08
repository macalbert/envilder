from __future__ import annotations

import json
import os
from collections.abc import Collection, Mapping
from pathlib import Path
from typing import Generator
from unittest.mock import patch

import pytest
from envilder import (
    ContractValidationError,
    Envilder,
    ISecretExistenceChecker,
    SecretExistence,
    SecretExistenceStatus,
    SecretProviderType,
)

_FACTORY = "envilder.application.envilder_facade._SecretProviderFactory.create"

_SECRETS = {"/app/db-url": "postgres://fake", "/app/api-key": "sk-fake"}


class _FakeProvider:
    def get_secret(self, name: str) -> str | None:
        return _SECRETS.get(name)


class _CheckableFakeProvider(_FakeProvider, ISecretExistenceChecker):
    def __init__(self) -> None:
        self.checked: list[str] = []

    def check_secrets_exist(
        self, names: Collection[str]
    ) -> Mapping[str, SecretExistence]:
        self.checked.extend(names)
        return {
            name: SecretExistence(
                SecretExistenceStatus.EXISTS
                if name in _SECRETS
                else SecretExistenceStatus.MISSING
            )
            for name in names
        }


def _write_map_file(tmp_path: Path, document: dict[str, object]) -> str:
    path = tmp_path / "envilder.json"
    path.write_text(json.dumps(document), encoding="utf-8")
    return str(path)


@pytest.fixture()
def map_file(tmp_path: Path) -> str:
    return _write_map_file(
        tmp_path, {"DB_URL": "/app/db-url", "API_KEY": "/app/api-key"}
    )


@pytest.fixture()
def env_cleanup() -> Generator[None, None, None]:
    yield
    for key in ("DB_URL", "API_KEY"):
        os.environ.pop(key, None)


class TestEnvilderWithInjectedSecretProvider:
    def Should_ResolveFromInjectedProvider_When_SecretProviderInjected(
        self, map_file: str
    ) -> None:
        # Arrange
        sut = Envilder.from_map_file(map_file).with_secret_provider(
            _FakeProvider()
        )

        # Act
        with patch(_FACTORY) as factory:
            actual = sut.resolve()

        # Assert
        assert actual == {"DB_URL": "postgres://fake", "API_KEY": "sk-fake"}
        factory.assert_not_called()

    def Should_CheckKeysWithInjectedProvider_When_ProviderCanCheckExistence(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path, {"DB_URL": "/app/db-url", "TOKEN": "/app/token"}
        )
        sut = Envilder.from_map_file(path).with_secret_provider(
            _CheckableFakeProvider()
        )

        # Act
        with patch(_FACTORY) as factory:
            actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert [(k.variable, k.status, k.provider) for k in actual.keys] == [
            ("DB_URL", SecretExistenceStatus.EXISTS, SecretProviderType.AWS),
            ("TOKEN", SecretExistenceStatus.MISSING, SecretProviderType.AWS),
        ]
        factory.assert_not_called()

    def Should_ReportEveryKeyAsProviderError_When_InjectedProviderCannotCheckExistence(
        self, map_file: str
    ) -> None:
        # Arrange
        sut = Envilder.from_map_file(map_file).with_secret_provider(
            _FakeProvider()
        )

        # Act
        actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert [(k.variable, k.status) for k in actual.keys] == [
            ("DB_URL", SecretExistenceStatus.PROVIDER_ERROR),
            ("API_KEY", SecretExistenceStatus.PROVIDER_ERROR),
        ]
        assert (
            actual.keys[0].reason
            == "The provider cannot check whether a secret exists."
        )

    def Should_RaiseContractValidationError_When_InjectedProviderCannotCheckExistence(
        self, map_file: str, env_cleanup: None
    ) -> None:
        # Arrange
        sut = (
            Envilder.from_map_file(map_file)
            .with_secret_provider(_FakeProvider())
            .with_contract_validation()
        )

        # Act
        act = lambda: sut.inject()  # noqa: E731

        # Assert
        with pytest.raises(ContractValidationError):
            act()
        assert "DB_URL" not in os.environ

    def Should_InjectSecrets_When_InjectedProviderPassesContractValidation(
        self, map_file: str, env_cleanup: None
    ) -> None:
        # Arrange
        sut = (
            Envilder.from_map_file(map_file)
            .with_secret_provider(_CheckableFakeProvider())
            .with_contract_validation()
        )

        # Act
        sut.inject()

        # Assert
        assert os.environ["DB_URL"] == "postgres://fake"
        assert os.environ["API_KEY"] == "sk-fake"

    def Should_ReportMapFileErrors_When_ProviderInjectedAndConfigIsIncomplete(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path, {"$config": {"provider": "azure"}, "DB_URL": "db-url"}
        )
        provider = _CheckableFakeProvider()
        sut = Envilder.from_map_file(path).with_secret_provider(provider)

        # Act
        actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert [e.key for e in actual.map_file_errors] == ["$config.vaultUrl"]
        assert provider.checked == []

    def Should_RaiseValueError_When_InjectedProviderIsNone(
        self, map_file: str
    ) -> None:
        # Arrange
        sut = Envilder.from_map_file(map_file)

        # Act
        act = lambda: sut.with_secret_provider(None)  # type: ignore[arg-type]  # noqa: E731

        # Assert
        with pytest.raises(ValueError, match="provider cannot be None"):
            act()
