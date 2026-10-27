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
    _SecretProviderFactory,
)


class TestSecretProviderFactory:
    @patch("envilder.infrastructure.secret_provider_factory.boto3")
    def Should_SelectAwsProvider_When_NoProviderSpecified(
        self, mock_boto3
    ) -> None:
        # Arrange
        mock_session = Mock()
        mock_boto3.Session.return_value = mock_session
        mock_session.client.return_value = Mock()
        config = MapFileConfig()

        # Act
        actual = _SecretProviderFactory.create(config)

        # Assert
        assert isinstance(actual, AwsSsmSecretProvider)
        mock_boto3.Session.assert_called_once()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    @patch(
        "envilder.infrastructure.secret_provider_factory.DefaultAzureCredential"
    )
    def Should_SelectAzureProvider_When_ConfigSpecifiesAzure(
        self, mock_credential, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://my-vault.vault.azure.net",
        )

        # Act
        actual = _SecretProviderFactory.create(config)

        # Assert
        assert isinstance(actual, AzureKeyVaultSecretProvider)
        mock_credential.assert_called_once()
        mock_secret_client.assert_called_once()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    @patch(
        "envilder.infrastructure.secret_provider_factory.DefaultAzureCredential"
    )
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
        actual = _SecretProviderFactory.create(config, options)

        # Assert
        assert isinstance(actual, AzureKeyVaultSecretProvider)
        mock_secret_client.assert_called_once()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    def Should_RejectVaultUrl_When_SchemeIsNotHttps(
        self, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="http://my-vault.vault.azure.net",
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="https://"):
            action()
        mock_secret_client.assert_not_called()

    @pytest.mark.parametrize(
        "vault_url",
        [
            "https://attacker.example.com",
            "https://my-vault.vault.azure.net.attacker.example.com",
            "https://my-vaultvault.azure.net",
        ],
    )
    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    def Should_RejectVaultUrl_When_HostIsNotAllowed(
        self, mock_secret_client, vault_url
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url=vault_url,
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="hostname must end with one of"):
            action()
        mock_secret_client.assert_not_called()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    def Should_RejectVaultUrl_When_UrlContainsUserInformation(
        self, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://attacker.example.com@my-vault.vault.azure.net",
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="user information"):
            action()
        mock_secret_client.assert_not_called()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    def Should_RejectVaultUrl_When_HostOnlyAllowedByOptionsIsMissing(
        self, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://kv-test.localhost.localstack.cloud:4566",
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="hostname must end with one of"):
            action()
        mock_secret_client.assert_not_called()

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    @patch(
        "envilder.infrastructure.secret_provider_factory.DefaultAzureCredential"
    )
    def Should_KeepChallengeResourceVerification_When_VaultHostIsDefault(
        self, mock_credential, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://my-vault.vault.azure.cn",
        )

        # Act
        _SecretProviderFactory.create(config)

        # Assert
        kwargs = mock_secret_client.call_args.kwargs
        assert kwargs["verify_challenge_resource"] is True

    @patch("envilder.infrastructure.secret_provider_factory.SecretClient")
    @patch(
        "envilder.infrastructure.secret_provider_factory.DefaultAzureCredential"
    )
    def Should_AcceptCustomVaultHost_When_AllowedThroughOptions(
        self, mock_credential, mock_secret_client
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://kv-test.localhost.localstack.cloud:4566",
        )
        options = EnvilderOptions(
            allowed_vault_hosts=[".localhost.localstack.cloud"]
        )

        # Act
        actual = _SecretProviderFactory.create(config, options)

        # Assert
        assert isinstance(actual, AzureKeyVaultSecretProvider)
        kwargs = mock_secret_client.call_args.kwargs
        assert kwargs["vault_url"] == (
            "https://kv-test.localhost.localstack.cloud:4566"
        )
        assert kwargs["verify_challenge_resource"] is False

    def Should_RequireVaultUrl_When_AzureProviderSelected(
        self,
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="Vault URL"):
            action()

    def Should_RaiseValueError_When_ConfigIsNone(self) -> None:
        # Act
        action = lambda: _SecretProviderFactory.create(None)  # type: ignore[arg-type]

        # Assert
        with pytest.raises(ValueError, match="config cannot be None"):
            action()

    def Should_RaiseValueError_When_UnsupportedProviderSpecified(
        self,
    ) -> None:
        # Arrange
        config = MapFileConfig(provider="gcp")  # type: ignore[arg-type]

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="Unsupported secret provider"):
            action()

    def Should_RaiseValueError_When_AzureProviderHasProfile(
        self,
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://my-vault.vault.azure.net",
            profile="my-profile",
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="profile.*Azure"):
            action()

    def Should_RaiseValueError_When_AzureProviderHasProfileViaOptions(
        self,
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AZURE,
            vault_url="https://my-vault.vault.azure.net",
        )
        options = EnvilderOptions(profile="my-profile")

        # Act
        action = lambda: _SecretProviderFactory.create(config, options)

        # Assert
        with pytest.raises(ValueError, match="profile.*Azure"):
            action()

    def Should_RaiseValueError_When_AwsProviderHasVaultUrl(
        self,
    ) -> None:
        # Arrange
        config = MapFileConfig(
            provider=SecretProviderType.AWS,
            vault_url="https://my-vault.vault.azure.net",
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config)

        # Assert
        with pytest.raises(ValueError, match="Vault URL.*AWS"):
            action()

    def Should_RaiseValueError_When_AwsProviderHasVaultUrlViaOptions(
        self,
    ) -> None:
        # Arrange
        config = MapFileConfig()
        options = EnvilderOptions(
            vault_url="https://my-vault.vault.azure.net",
        )

        # Act
        action = lambda: _SecretProviderFactory.create(config, options)

        # Assert
        with pytest.raises(ValueError, match="Vault URL.*AWS"):
            action()
