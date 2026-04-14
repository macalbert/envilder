from unittest.mock import Mock

import pytest
from azure.core.exceptions import HttpResponseError, ResourceNotFoundError
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)


class TestAzureKeyVaultSecretProvider:
    def Should_ReturnSecret_When_AzureKeyVaultSecretExists(
        self,
    ) -> None:
        # Arrange
        secret_client = Mock()
        mock_response = Mock()
        mock_response.value = "azure-secret-value"
        secret_client.get_secret.return_value = mock_response
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.get_secret("test-secret")

        # Assert
        assert actual == "azure-secret-value"
        secret_client.get_secret.assert_called_once_with("test-secret")

    def Should_ReturnNone_When_AzureKeyVaultSecretNotFound(
        self,
    ) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.get_secret.side_effect = ResourceNotFoundError(
            "Secret not found"
        )
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.get_secret("missing-secret")

        # Assert
        assert actual is None
        secret_client.get_secret.assert_called_once()

    def Should_RaiseHttpResponseError_When_AzureKeyVaultReturnsNon404Error(
        self,
    ) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.get_secret.side_effect = HttpResponseError(
            "Forbidden", response=Mock(status_code=403)
        )
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        action = lambda: sut.get_secret("forbidden-secret")

        # Assert
        with pytest.raises(HttpResponseError):
            action()

    def Should_RaiseValueError_When_NameIsEmpty(self) -> None:
        # Arrange
        secret_client = Mock()
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        action = lambda: sut.get_secret("")

        # Assert
        with pytest.raises(ValueError, match="cannot be null or empty"):
            action()
