import os
from typing import Generator
from unittest.mock import Mock

import pytest
from envilder.application.envilder_client import EnvilderClient
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.parsed_map_file import ParsedMapFile


@pytest.fixture()
def env_cleanup() -> Generator[list[str], None, None]:
    keys: list[str] = []
    yield keys
    for key in keys:
        os.environ.pop(key, None)


class TestEnvilderClient:
    def Should_SetEnvironmentVariables_When_InjectIntoEnvironmentCalled(
        self, env_cleanup: list[str]
    ) -> None:
        # Arrange
        secrets = {
            "INJECT_TEST_MY_TOKEN": "token-123",
            "INJECT_TEST_MY_DB": "conn-string",
        }
        env_cleanup.extend(secrets.keys())

        # Act
        EnvilderClient.inject_into_environment(secrets)

        # Assert
        assert os.environ["INJECT_TEST_MY_TOKEN"] == "token-123"
        assert os.environ["INJECT_TEST_MY_DB"] == "conn-string"

    def Should_ResolveAllSecrets_When_MapFileHasMultipleMappings(
        self,
    ) -> None:
        # Arrange
        secret_provider = Mock()
        secret_provider.get_secret = Mock(
            side_effect=lambda name: {
                "/Test/Token": "token-value",
                "/App/DbPassword": "db-password",
            }.get(name)
        )
        map_file = ParsedMapFile(
            config=MapFileConfig(),
            mappings={
                "TOKEN_SECRET": "/Test/Token",
                "DB_PASSWORD": "/App/DbPassword",
            },
        )
        sut = EnvilderClient(secret_provider)

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert len(actual) == 2
        assert actual["TOKEN_SECRET"] == "token-value"
        assert actual["DB_PASSWORD"] == "db-password"
        assert secret_provider.get_secret.call_count == 2

    def Should_SkipNullSecrets_When_ProviderReturnsNull(
        self,
    ) -> None:
        # Arrange
        secret_provider = Mock()
        secret_provider.get_secret = Mock(
            side_effect=lambda name: {
                "/App/DbPassword": "db-password",
                "/Missing/Secret": None,
            }.get(name)
        )
        map_file = ParsedMapFile(
            config=MapFileConfig(),
            mappings={
                "DB_PASSWORD": "/App/DbPassword",
                "MISSING_KEY": "/Missing/Secret",
            },
        )
        sut = EnvilderClient(secret_provider)

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert len(actual) == 1
        assert "DB_PASSWORD" in actual
        assert "MISSING_KEY" not in actual
        assert secret_provider.get_secret.call_count == 2
