from unittest.mock import Mock, patch

import pytest

from envilder.domain.envilder_options import EnvilderOptions
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)
from envilder.infrastructure.secret_provider_factory import (
    SecretProviderFactory,
)


class TestSecretProviderFactory:
    @patch("envilder.infrastructure.secret_provider_factory.boto3")
    def Should_SelectAwsProvider_When_NoProviderSpecified(self, mock_boto3) -> None:
        # Arrange
        mock_session = Mock()
        mock_boto3.Session.return_value = mock_session
        mock_session.client.return_value = Mock()
        config = MapFileConfig()

        # Act
        actual = SecretProviderFactory.create(config)

        # Assert
        assert isinstance(actual, AwsSsmSecretProvider)
        mock_boto3.Session.assert_called_once()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    @patch("envilder.infrastructure.secret_provider_factory.DefaultAzureCredential")
    def Should_SelectAzureProvider_When_ConfigSpecifiesAzure(
        self, mock_credential, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://my-vault.vault.azure.net",
        )

        # Act
        actual = SecretProviderFactory.create(config)

        # Assert
        assert isinstance(actual, AzureKeyVaultSecretProvider)
        mock_credential.assert_called_once()
        mock_secret_client.assert_called_once()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    @patch("envilder.infrastructure.secret_provider_factory.DefaultAzureCredential")
    def Should_OverrideConfigWithOptions_When_BothProvided(
        self, mock_credential, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AWS,
        )
        options = EnvilderOptions(
            provider=SecretProviderType.AZURE,
            vault_url="https://override-vault.vault.azure.net",
        )

        # Act
        actual = SecretProviderFactory.create(config, options)

        # Assert
        assert isinstance(actual, AzureKeyVaultSecretProvider)
        mock_secret_client.assert_called_once()

    def Should_RequireVaultUrl_When_AzureProviderSelected(
        self,
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
        )

        # Act & Assert
        with pytest.raises(ValueError, match="Vault URL"):
            SecretProviderFactory.create(config)

    def Should_RaiseValueError_When_ConfigIsNone(self) -> None:
        # Act & Assert
        with pytest.raises(ValueError, match="config cannot be None"):
            SecretProviderFactory.create(None)
