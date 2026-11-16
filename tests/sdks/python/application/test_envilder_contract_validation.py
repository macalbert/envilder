from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Generator
from unittest.mock import Mock, patch

import pytest
from envilder.application.contract_validation import ContractValidationError
from envilder.application.envilder_facade import Envilder
from envilder.domain.contract_validation_result import (
    SecretExistence,
    SecretExistenceStatus,
)
from envilder.domain.ports.secret_existence_checker import (
    _CheckableSecretProvider,
)
from envilder.domain.secret_provider_type import SecretProviderType

_FACTORY = "envilder.application.envilder_facade._SecretProviderFactory.create"

_EXISTS = SecretExistence(SecretExistenceStatus.EXISTS)
_MISSING = SecretExistence(SecretExistenceStatus.MISSING)


def _write_map_file(tmp_path: Path, document: dict[str, object]) -> str:
    path = tmp_path / "envilder.json"
    path.write_text(json.dumps(document), encoding="utf-8")
    return str(path)


def _provider(existence: dict[str, SecretExistence]) -> Mock:
    provider = Mock(spec=_CheckableSecretProvider)
    provider.check_secrets_exist.side_effect = lambda names: {
        name: existence[name] for name in names if name in existence
    }
    provider.get_secret.side_effect = lambda name: f"fictional-value-{name}"
    return provider


@pytest.fixture()
def env_cleanup() -> Generator[list[str], None, None]:
    keys: list[str] = []
    yield keys
    for key in keys:
        os.environ.pop(key, None)


class TestValidateContractWithUnknownAwsProfile:
    @pytest.fixture(autouse=True)
    def _empty_aws_config(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        empty = tmp_path / "empty-aws-config"
        empty.write_text("", encoding="utf-8")
        monkeypatch.setenv("AWS_CONFIG_FILE", str(empty))
        monkeypatch.setenv("AWS_SHARED_CREDENTIALS_FILE", str(empty))

    def Should_ReportAuthenticationFailed_When_ProfileDoesNotExist(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path,
            {"$config": {"profile": "nonexistent"}, "DB_URL": "/app/db"},
        )
        sut = Envilder.from_map_file(path)

        # Act
        actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert len(actual.keys) == 1
        assert actual.keys[0].variable == "DB_URL"
        assert (
            actual.keys[0].status
            is SecretExistenceStatus.AUTHENTICATION_FAILED
        )
        assert "nonexistent" in (actual.keys[0].reason or "")

    def Should_ReportAuthenticationFailed_When_ProfileIsWhitespace(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        sut = Envilder.from_map_file(path).with_profile("  ")

        # Act
        actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert (
            actual.keys[0].status
            is SecretExistenceStatus.AUTHENTICATION_FAILED
        )

    def Should_StillRaiseValueError_When_LoadingWithUnknownProfile(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path,
            {"$config": {"profile": "nonexistent"}, "DB_URL": "/app/db"},
        )
        sut = Envilder.from_map_file(path)

        # Act / Assert
        with pytest.raises(ValueError, match="nonexistent"):
            sut.resolve()


class TestValidateContract:
    def Should_BeValid_When_EveryKeyExists(self, tmp_path: Path) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path, {"DB_URL": "/app/db", "API_KEY": "/app/key"}
        )
        provider = _provider({"/app/db": _EXISTS, "/app/key": _EXISTS})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is True
        assert actual.map_file_errors == ()
        assert [(k.variable, k.path, k.provider) for k in actual.keys] == [
            ("DB_URL", "/app/db", SecretProviderType.AWS),
            ("API_KEY", "/app/key", SecretProviderType.AWS),
        ]
        provider.check_secrets_exist.assert_called_once_with(
            ["/app/db", "/app/key"]
        )
        provider.get_secret.assert_not_called()

    def Should_NotCreateOrCallProvider_When_MapFileIsInvalid(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"BAD NAME": "/app/db"})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY) as factory:
            actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert [e.key for e in actual.map_file_errors] == ["BAD NAME"]
        assert actual.keys == ()
        factory.assert_not_called()

    def Should_ReportInvalidJson_When_MapFileCannotBeParsed(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = tmp_path / "envilder.json"
        path.write_text('{"A": ', encoding="utf-8")
        sut = Envilder.from_map_file(str(path))

        # Act
        with patch(_FACTORY) as factory:
            actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert actual.map_file_errors[0].key == "(root)"
        factory.assert_not_called()

    def Should_ValidateAgainstBuilderOverrides_When_OverridesAreSet(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "db"})
        sut = Envilder.from_map_file(path).with_provider(
            SecretProviderType.AZURE
        )

        # Act
        with patch(_FACTORY) as factory:
            actual = sut.validate_contract()

        # Assert
        assert [e.key for e in actual.map_file_errors] == ["$config.vaultUrl"]
        assert "with_vault_url()" in actual.map_file_errors[0].message
        factory.assert_not_called()

    def Should_ReportMissing_When_KeyDoesNotExist(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path, {"DB_URL": "/app/db", "API_KEY": "/app/key"}
        )
        provider = _provider({"/app/db": _EXISTS, "/app/key": _MISSING})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert [k.status for k in actual.keys] == [
            SecretExistenceStatus.EXISTS,
            SecretExistenceStatus.MISSING,
        ]

    @pytest.mark.parametrize(
        "status",
        [
            SecretExistenceStatus.ACCESS_DENIED,
            SecretExistenceStatus.AUTHENTICATION_FAILED,
            SecretExistenceStatus.PROVIDER_ERROR,
        ],
    )
    def Should_ReportStatusAndReason_When_ProviderCannotConfirm(
        self, tmp_path: Path, status: SecretExistenceStatus
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        provider = _provider({"/app/db": SecretExistence(status, "why")})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        assert actual.keys[0].status is status
        assert actual.keys[0].reason == "why"

    def Should_ReportProviderError_When_CheckerReturnsNoResultForPath(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        provider = _provider({})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.validate_contract()

        # Assert
        assert actual.keys[0].status is SecretExistenceStatus.PROVIDER_ERROR
        assert (
            actual.keys[0].reason
            == "The provider returned no result for this secret."
        )

    def Should_CheckSharedPathOnce_When_TwoVariablesMapToIt(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"A": "/app/x", "B": "/app/x"})
        provider = _provider({"/app/x": _EXISTS})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.validate_contract()

        # Assert
        provider.check_secrets_exist.assert_called_once_with(["/app/x"])
        assert [k.variable for k in actual.keys] == ["A", "B"]

    def Should_BeValidWithoutProviderCall_When_MappingIsEmpty(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {})
        provider = _provider({})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is True
        provider.check_secrets_exist.assert_not_called()

    def Should_ReportEffectiveProvider_When_OverrideSelectsAzure(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"A": "secret-a"})
        provider = _provider({"secret-a": _EXISTS})
        sut = (
            Envilder.from_map_file(path)
            .with_provider(SecretProviderType.AZURE)
            .with_vault_url("https://v.vault.azure.net")
        )

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.validate_contract()

        # Assert
        assert actual.keys[0].provider is SecretProviderType.AZURE

    def Should_RaiseFileNotFound_When_MapFileDoesNotExist(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        sut = Envilder.from_map_file(str(tmp_path / "missing.json"))

        # Act
        act = sut.validate_contract

        # Assert
        with pytest.raises(FileNotFoundError):
            act()


class TestContractValidationOnLoad:
    def Should_NotCheckExistence_When_ValidationIsNotEnabled(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        provider = _provider({"/app/db": _MISSING})
        sut = Envilder.from_map_file(path)

        # Act
        with patch(_FACTORY, return_value=provider):
            actual = sut.resolve()

        # Assert
        assert actual == {"DB_URL": "fictional-value-/app/db"}
        provider.check_secrets_exist.assert_not_called()

    def Should_ResolveWithSameProvider_When_ContractHolds(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        provider = _provider({"/app/db": _EXISTS})
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        with patch(_FACTORY, return_value=provider) as factory:
            actual = sut.resolve()

        # Assert
        assert actual == {"DB_URL": "fictional-value-/app/db"}
        factory.assert_called_once()
        provider.check_secrets_exist.assert_called_once()
        provider.get_secret.assert_called_once_with("/app/db")

    def Should_CheckOnce_When_InjectIsCalled(
        self, tmp_path: Path, env_cleanup: list[str]
    ) -> None:
        # Arrange
        env_cleanup.append("CONTRACT_DB_URL")
        path = _write_map_file(tmp_path, {"CONTRACT_DB_URL": "/app/db"})
        provider = _provider({"/app/db": _EXISTS})
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        with patch(_FACTORY, return_value=provider):
            sut.inject()

        # Assert
        provider.check_secrets_exist.assert_called_once()
        assert os.environ["CONTRACT_DB_URL"] == "fictional-value-/app/db"

    def Should_RaiseWithKeysAndPaths_When_KeyIsMissingOrDenied(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path,
            {"DB_URL": "/app/db", "API_KEY": "/app/key", "OK": "/app/ok"},
        )
        provider = _provider(
            {
                "/app/db": _MISSING,
                "/app/key": SecretExistence(
                    SecretExistenceStatus.ACCESS_DENIED
                ),
                "/app/ok": _EXISTS,
            }
        )
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        act = sut.resolve

        # Assert
        with patch(_FACTORY, return_value=provider):
            with pytest.raises(ContractValidationError) as raised:
                act()
        assert str(raised.value) == (
            "Map file contract validation failed: DB_URL (/app/db): missing,"
            " API_KEY (/app/key): access_denied"
        )
        assert raised.value.result.is_valid is False
        provider.get_secret.assert_not_called()

    def Should_RaiseWithAuthenticationStatus_When_CredentialsAreRejected(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        provider = _provider(
            {
                "/app/db": SecretExistence(
                    SecretExistenceStatus.AUTHENTICATION_FAILED, "rejected"
                )
            }
        )
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        act = sut.inject

        # Assert
        with patch(_FACTORY, return_value=provider):
            with pytest.raises(ContractValidationError) as raised:
                act()
        assert "DB_URL (/app/db): authentication_failed" in str(raised.value)

    def Should_RaiseWithProviderErrorStatus_When_ProviderFails(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        provider = _provider(
            {
                "/app/db": SecretExistence(
                    SecretExistenceStatus.PROVIDER_ERROR, "unreachable"
                )
            }
        )
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        act = sut.resolve

        # Assert
        with patch(_FACTORY, return_value=provider):
            with pytest.raises(ContractValidationError) as raised:
                act()
        assert "DB_URL (/app/db): provider_error" in str(raised.value)

    def Should_RaiseMapFileErrorsWithoutProvider_When_MapFileIsInvalid(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path, {"BAD NAME": "fictional-pasted-value"}
        )
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        act = sut.resolve

        # Assert
        with patch(_FACTORY) as factory:
            with pytest.raises(ContractValidationError) as raised:
                act()
        message = str(raised.value)
        assert message.startswith(
            "Map file contract validation failed: BAD NAME: Invalid"
        )
        assert "fictional-pasted-value" not in message
        factory.assert_not_called()

    def Should_NeverIncludeSecretValue_When_ValidationFails(
        self, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"DB_URL": "/app/db"})
        provider = _provider({"/app/db": _MISSING})
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        act = sut.resolve

        # Assert
        with patch(_FACTORY, return_value=provider):
            with pytest.raises(ContractValidationError) as raised:
                act()
        assert "fictional-value" not in str(raised.value)
        assert "fictional-value" not in repr(raised.value.result)
