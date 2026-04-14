import json
import os
from typing import Generator

import pytest

from envilder.application.envilder_client import EnvilderClient
from envilder.application.map_file_parser import MapFileParser
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.parsed_map_file import ParsedMapFile

pytestmark = pytest.mark.acceptance


@pytest.fixture()
def env_cleanup() -> Generator[list[str], None, None]:
    keys: list[str] = []
    yield keys
    for key in keys:
        os.environ.pop(key, None)


class TestConsumerExperience:
    def Should_ResolveAwsSecretsEndToEnd_When_MapFileUsesDefaultAwsProvider(
        self, ssm_client, aws_provider
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/e2e/api-key",
            Value="sk-test-12345",
            Type="SecureString",
            Overwrite=True,
        )
        ssm_client.put_parameter(
            Name="/e2e/db-url",
            Value="postgres://localhost:5432/mydb",
            Type="SecureString",
            Overwrite=True,
        )
        json_content = json.dumps(
            {
                "$config": {"provider": "aws"},
                "DB_URL": "/e2e/db-url",
                "API_KEY": "/e2e/api-key",
            }
        )
        map_file = MapFileParser().parse(json_content)
        sut = EnvilderClient(aws_provider)

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert actual["DB_URL"] == "postgres://localhost:5432/mydb"
        assert actual["API_KEY"] == "sk-test-12345"

    def Should_ResolveAzureSecretsEndToEnd_When_MapFileUsesAzureProvider(
        self, azure_secret_client, azure_provider, lowkey_vault_url
    ) -> None:
        # Arrange
        azure_secret_client.set_secret("e2e-vault-secret", "azure-e2e-value")
        json_content = json.dumps(
            {
                "$config": {
                    "provider": "azure",
                    "vaultUrl": lowkey_vault_url,
                },
                "VAULT_SECRET": "e2e-vault-secret",
            }
        )
        map_file = MapFileParser().parse(json_content)
        sut = EnvilderClient(azure_provider)

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert actual["VAULT_SECRET"] == "azure-e2e-value"

    def Should_OmitMissingSecrets_When_SomeParametersDoNotExistInStore(
        self, ssm_client, aws_provider
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/e2e/db3-url",
            Value="postgres://localhost:5432/mydb3",
            Type="SecureString",
            Overwrite=True,
        )
        json_content = json.dumps(
            {
                "$config": {"provider": "aws"},
                "DB_URL": "/e2e/db3-url",
                "MISSING_KEY": "/e2e/does-not-exist",
            }
        )
        map_file = MapFileParser().parse(json_content)
        sut = EnvilderClient(aws_provider)

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert actual["DB_URL"] == "postgres://localhost:5432/mydb3"
        assert "MISSING_KEY" not in actual

    def Should_InjectSecretsIntoEnvironment_When_ResolvedFromAws(
        self, ssm_client, aws_provider, env_cleanup: list[str]
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/e2e/inject-test",
            Value="injected-value",
            Type="SecureString",
            Overwrite=True,
        )
        map_file = ParsedMapFile(
            config=MapFileConfig(),
            mappings={"E2E_INJECT_TEST": "/e2e/inject-test"},
        )
        sut = EnvilderClient(aws_provider)
        secrets = sut.resolve_secrets(map_file)
        env_cleanup.extend(secrets.keys())

        # Act
        EnvilderClient.inject_into_environment(secrets)

        # Assert
        assert os.environ["E2E_INJECT_TEST"] == "injected-value"
