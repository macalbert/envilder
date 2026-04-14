import pytest

from envilder.application.map_file_parser import MapFileParser
from envilder.domain.secret_provider_type import SecretProviderType


class TestMapFileParser:
    def Should_ParseMappings_When_MapFileHasNoConfig(
        self,
    ) -> None:
        # Arrange
        json_content = """{
            "TOKEN_SECRET": "/Test/Token",
            "DB_PASSWORD": "/App/DbPassword"
        }"""
        sut = MapFileParser()

        # Act
        actual = sut.parse(json_content)

        # Assert
        assert actual.config.provider is None
        assert actual.config.vault_url is None
        assert actual.config.profile is None
        assert len(actual.mappings) == 2
        assert actual.mappings["TOKEN_SECRET"] == "/Test/Token"
        assert actual.mappings["DB_PASSWORD"] == "/App/DbPassword"

    def Should_ParseConfigAndMappings_When_MapFileHasAwsConfig(
        self,
    ) -> None:
        # Arrange
        json_content = """{
            "$config": {
                "provider": "aws"
            },
            "TOKEN_SECRET": "/Test/Token"
        }"""
        sut = MapFileParser()

        # Act
        actual = sut.parse(json_content)

        # Assert
        assert actual.config.provider == SecretProviderType.AWS
        assert actual.config.vault_url is None
        assert actual.config.profile is None
        assert len(actual.mappings) == 1
        assert actual.mappings["TOKEN_SECRET"] == "/Test/Token"

    def Should_ParseConfigAndMappings_When_MapFileHasAzureConfig(
        self,
    ) -> None:
        # Arrange
        json_content = """{
            "$config": {
                "provider": "azure",
                "vaultUrl": "https://my-vault.vault.azure.net"
            },
            "TOKEN_SECRET": "test-secret"
        }"""
        sut = MapFileParser()

        # Act
        actual = sut.parse(json_content)

        # Assert
        assert actual.config.provider == SecretProviderType.AZURE
        assert actual.config.vault_url == "https://my-vault.vault.azure.net"
        assert actual.config.profile is None
        assert len(actual.mappings) == 1
        assert actual.mappings["TOKEN_SECRET"] == "test-secret"

    def Should_DefaultToEmptyConfig_When_ConfigSectionIsInvalid(
        self,
    ) -> None:
        # Arrange
        json_content = """{
            "$config": "invalid",
            "TOKEN_SECRET": "/Test/Token"
        }"""
        sut = MapFileParser()

        # Act
        actual = sut.parse(json_content)

        # Assert
        assert actual.config.provider is None
        assert actual.config.vault_url is None
        assert actual.config.profile is None
        assert len(actual.mappings) == 1
        assert actual.mappings["TOKEN_SECRET"] == "/Test/Token"

    def Should_SkipNonStringValues_When_MapFileContainsNonStringEntries(
        self,
    ) -> None:
        # Arrange
        json_content = """{
            "TOKEN_SECRET": "/Test/Token",
            "NUMERIC_VALUE": 42,
            "NULL_VALUE": null,
            "OBJECT_VALUE": { "nested": true }
        }"""
        sut = MapFileParser()

        # Act
        actual = sut.parse(json_content)

        # Assert
        assert len(actual.mappings) == 1
        assert actual.mappings["TOKEN_SECRET"] == "/Test/Token"

    def Should_ParseProfile_When_MapFileHasAwsProfileConfig(
        self,
    ) -> None:
        # Arrange
        json_content = """{
            "$config": {
                "provider": "aws",
                "profile": "production"
            },
            "TOKEN_SECRET": "/Test/Token"
        }"""
        sut = MapFileParser()

        # Act
        actual = sut.parse(json_content)

        # Assert
        assert actual.config.provider == SecretProviderType.AWS
        assert actual.config.profile == "production"
        assert len(actual.mappings) == 1

    def Should_RaiseValueError_When_JsonIsNotAnObject(self) -> None:
        # Arrange
        sut = MapFileParser()

        # Act
        action = lambda: sut.parse('["Test/Token"]')

        # Assert
        with pytest.raises(ValueError, match="must be a JSON object"):
            action()

    def Should_ParseProvider_When_ProviderIsMixedCase(self) -> None:
        # Arrange
        json_content = """{
            "$config": {
                "provider": "Azure",
                "vaultUrl": "https://my-vault.vault.azure.net"
            },
            "TOKEN_SECRET": "test-secret"
        }"""
        sut = MapFileParser()

        # Act
        actual = sut.parse(json_content)

        # Assert
        assert actual.config.provider == SecretProviderType.AZURE

    def Should_RaiseValueError_When_ProviderIsUnsupported(self) -> None:
        # Arrange
        json_content = """{
            "$config": {
                "provider": "azuer"
            },
            "TOKEN_SECRET": "/Test/Token"
        }"""
        sut = MapFileParser()

        # Act
        action = lambda: sut.parse(json_content)

        # Assert
        with pytest.raises(ValueError, match="Unsupported provider"):
            action()
