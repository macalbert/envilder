from __future__ import annotations

import os
from typing import Generator
from unittest.mock import Mock, patch

import pytest
from envilder.application.envilder_facade import Envilder
from envilder.domain.secret_provider_type import SecretProviderType


@pytest.fixture()
def env_cleanup() -> Generator[list[str], None, None]:
    keys: list[str] = []
    yield keys
    for key in keys:
        os.environ.pop(key, None)


@pytest.fixture()
def mock_provider() -> Mock:
    provider = Mock()
    provider.get_secret = Mock(
        side_effect=lambda name: {
            "/envilder/development/localstack/authToken": "test-auth-token",
        }.get(name)
    )
    return provider


MAP_FILE = "tests/sdks/python/secrets-map.json"


class TestEnvilderResolve:
    def Should_ReturnSecrets_When_ResolveCalledWithFile(
        self, mock_provider: Mock
    ) -> None:
        # Arrange
        sut = Envilder.from_file(MAP_FILE)

        # Act
        with patch(
            "envilder.application.envilder_facade.SecretProviderFactory.create",
            return_value=mock_provider,
        ):
            actual = sut.resolve()

        # Assert
        assert actual["LOCALSTACK_AUTH_TOKEN"] == "test-auth-token"

    def Should_ReturnSecrets_When_StaticResolveCalledWithFile(
        self, mock_provider: Mock
    ) -> None:
        # Act
        with patch(
            "envilder.application.envilder_facade.SecretProviderFactory.create",
            return_value=mock_provider,
        ):
            actual = Envilder.resolve_file(MAP_FILE)

        # Assert
        assert actual["LOCALSTACK_AUTH_TOKEN"] == "test-auth-token"


class TestEnvilderInject:
    def Should_InjectIntoEnvironment_When_LoadCalled(
        self, mock_provider: Mock, env_cleanup: list[str]
    ) -> None:
        # Arrange
        env_cleanup.append("LOCALSTACK_AUTH_TOKEN")

        # Act
        with patch(
            "envilder.application.envilder_facade.SecretProviderFactory.create",
            return_value=mock_provider,
        ):
            Envilder.load(MAP_FILE)

        # Assert
        assert os.environ["LOCALSTACK_AUTH_TOKEN"] == "test-auth-token"

    def Should_InjectIntoEnvironment_When_FluentInjectCalled(
        self, mock_provider: Mock, env_cleanup: list[str]
    ) -> None:
        # Arrange
        env_cleanup.append("LOCALSTACK_AUTH_TOKEN")

        # Act
        with patch(
            "envilder.application.envilder_facade.SecretProviderFactory.create",
            return_value=mock_provider,
        ):
            actual = Envilder.from_file(MAP_FILE).inject()

        # Assert
        assert os.environ["LOCALSTACK_AUTH_TOKEN"] == "test-auth-token"
        assert actual["LOCALSTACK_AUTH_TOKEN"] == "test-auth-token"


class TestEnvilderOverrides:
    def Should_UseOverriddenProvider_When_WithProviderCalled(
        self, mock_provider: Mock
    ) -> None:
        # Act
        with patch(
            "envilder.application.envilder_facade.SecretProviderFactory.create",
            return_value=mock_provider,
        ) as factory_mock:
            Envilder.from_file(MAP_FILE).with_provider(
                SecretProviderType.AZURE
            ).with_vault_url("https://my-vault.vault.azure.net").resolve()

        # Assert
        call_args = factory_mock.call_args
        options = call_args[1]["options"]
        assert options.provider == SecretProviderType.AZURE
        assert options.vault_url == "https://my-vault.vault.azure.net"

    def Should_UseOverriddenProfile_When_WithProfileCalled(
        self, mock_provider: Mock
    ) -> None:
        # Act
        with patch(
            "envilder.application.envilder_facade.SecretProviderFactory.create",
            return_value=mock_provider,
        ) as factory_mock:
            Envilder.from_file(MAP_FILE).with_profile("staging").resolve()

        # Assert
        call_args = factory_mock.call_args
        options = call_args[1]["options"]
        assert options.profile == "staging"


class TestEnvilderValidation:
    def Should_RaiseFileNotFoundError_When_FileDoesNotExist(
        self,
    ) -> None:
        # Act
        action = lambda: Envilder.load("non-existent.json")

        # Assert
        with pytest.raises(FileNotFoundError):
            action()

    def Should_RaiseValueError_When_FilePathIsEmpty(
        self,
    ) -> None:
        # Act
        action = lambda: Envilder.from_file("")

        # Assert
        with pytest.raises(ValueError, match="file_path"):
            action()
