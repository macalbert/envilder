import pytest
from envilder.application.envilder_client import EnvilderClient
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.parsed_map_file import ParsedMapFile

pytestmark = pytest.mark.acceptance


class TestAwsSsmAcceptance:
    def Should_ResolveSecretFromSsm_When_ParameterExistsInLocalStack(
        self, ssm_client, aws_provider
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/Test/MySecret",
            Value="real-secret-from-localstack",
            Type="SecureString",
            Overwrite=True,
        )
        sut = EnvilderClient(aws_provider)
        map_file = ParsedMapFile(
            config=MapFileConfig(),
            mappings={"MY_SECRET": "/Test/MySecret"},
        )

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert "MY_SECRET" in actual
        assert actual["MY_SECRET"] == "real-secret-from-localstack"

    def Should_ReturnEmptyForMissingSsmParameter_When_ParameterDoesNotExist(
        self, aws_provider
    ) -> None:
        # Arrange
        sut = EnvilderClient(aws_provider)
        map_file = ParsedMapFile(
            config=MapFileConfig(),
            mappings={"NONEXISTENT": "/Test/DoesNotExist"},
        )

        # Act
        actual = sut.resolve_secrets(map_file)

        # Assert
        assert len(actual) == 0
