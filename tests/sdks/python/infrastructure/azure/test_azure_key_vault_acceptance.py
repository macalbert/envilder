import pytest
from envilder.application.envilder_client import EnvilderClient
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.secret_provider_type import SecretProviderType

pytestmark = pytest.mark.acceptance


class TestAzureKeyVaultAcceptance:
    def Should_ResolveSecretFromKeyVault_When_SecretExistsInLowkeyVault(
        self, azure_secret_client, azure_provider, lowkey_vault_url
    ) -> None:
        # Arrange
        azure_secret_client.set_secret("test-secret", "vault-secret-value")
        sut = EnvilderClient(azure_provider)
        map_file = ParsedMapFile(
            config=MapFileConfig(
                provider=SecretProviderType.AZURE,
                vault_url=lowkey_vault_url,
            ),
            mappings={"VAULT_SECRET": "test-secret"},
        )

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert "VAULT_SECRET" in actual
        assert actual["VAULT_SECRET"] == "vault-secret-value"

    def Should_ReturnEmptyForMissingKeyVaultSecret_When_SecretDoesNotExist(
        self, azure_provider, lowkey_vault_url
    ) -> None:
        # Arrange
        sut = EnvilderClient(azure_provider)
        map_file = ParsedMapFile(
            config=MapFileConfig(
                provider=SecretProviderType.AZURE,
                vault_url=lowkey_vault_url,
            ),
            mappings={"MISSING": "nonexistent-secret"},
        )

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert len(actual) == 0
