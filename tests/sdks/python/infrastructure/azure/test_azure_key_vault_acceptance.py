import json
from pathlib import Path

import pytest
from envilder.application.envilder_client import EnvilderClient
from envilder.application.envilder_facade import Envilder
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.secret_provider_type import SecretProviderType

pytestmark = pytest.mark.acceptance


class TestAzureKeyVaultAcceptance:
    def Should_ResolveSecretFromKeyVault_When_SecretExistsInLocalStack(
        self, azure_secret_client, azure_provider, localstack_azure_vault_url
    ) -> None:
        # Arrange
        azure_secret_client.set_secret("test-secret", "vault-secret-value")
        sut = EnvilderClient(azure_provider)
        map_file = ParsedMapFile(
            config=MapFileConfig(
                provider=SecretProviderType.AZURE,
                vault_url=localstack_azure_vault_url,
            ),
            mappings={"VAULT_SECRET": "test-secret"},
        )

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert "VAULT_SECRET" in actual
        assert actual["VAULT_SECRET"] == "vault-secret-value"

    def Should_ReturnEmptyForMissingKeyVaultSecret_When_SecretDoesNotExist(
        self, azure_provider, localstack_azure_vault_url
    ) -> None:
        # Arrange
        sut = EnvilderClient(azure_provider)
        map_file = ParsedMapFile(
            config=MapFileConfig(
                provider=SecretProviderType.AZURE,
                vault_url=localstack_azure_vault_url,
            ),
            mappings={"MISSING": "nonexistent-secret"},
        )

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert len(actual) == 0

    def Should_ResolveSecretThroughFacade_When_EmulatorHostIsAllowed(
        self, azure_secret_client, localstack_azure_vault_url, tmp_path: Path
    ) -> None:
        # Arrange
        azure_secret_client.set_secret("facade-secret", "facade-value")
        map_path = tmp_path / "envilder.json"
        map_path.write_text(
            json.dumps(
                {
                    "$config": {
                        "provider": "azure",
                        "vaultUrl": localstack_azure_vault_url,
                    },
                    "FACADE_SECRET": "facade-secret",
                }
            ),
            encoding="utf-8",
        )
        sut = Envilder.from_map_file(str(map_path)).with_allowed_vault_hosts(
            ".localhost.localstack.cloud"
        )

        # Act
        actual = sut.resolve()

        # Assert
        assert actual == {"FACADE_SECRET": "facade-value"}
