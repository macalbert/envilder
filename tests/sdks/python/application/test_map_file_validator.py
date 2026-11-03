import json

import pytest
from envilder.application.map_file_validator import (
    validate_map_file,
    validate_map_file_content,
)
from envilder.domain.envilder_options import EnvilderOptions
from envilder.domain.secret_provider_type import SecretProviderType


def _errors(document: object, options: EnvilderOptions | None = None):
    return validate_map_file_content(
        json.dumps(document), options or EnvilderOptions()
    )


def _pairs(errors):
    return [(e.key, e.message) for e in errors]


class TestMapFileValidatorDocument:
    def Should_ReturnNoErrors_When_MapFileIsValid(self) -> None:
        # Arrange
        document = {
            "$schema": "https://envilder.com/map-file.v1.json",
            "$config": {"provider": "aws", "profile": "dev"},
            "DB_URL": "/app/db",
        }

        # Act
        actual = _errors(document)

        # Assert
        assert actual == []

    def Should_ReportNotValidJson_When_ContentCannotBeParsed(self) -> None:
        # Arrange
        content = '{"API_KEY": "fictional-pasted-value" oops'

        # Act
        actual = validate_map_file_content(content, EnvilderOptions())

        # Assert
        assert _pairs(actual) == [
            ("(root)", "The map file is not valid JSON.")
        ]

    def Should_ReportRootMustBeObject_When_DocumentIsAnArray(self) -> None:
        # Act
        actual = validate_map_file([], EnvilderOptions())

        # Assert
        assert _pairs(actual) == [
            ("(root)", "The map file must be a JSON object.")
        ]


class TestMapFileValidatorSchema:
    def Should_ReportInvalidName_When_VariableNameHasIllegalCharacters(
        self,
    ) -> None:
        # Act
        actual = _errors({"BAD NAME": "/app/x"})

        # Assert
        assert len(actual) == 1
        assert actual[0].key == "BAD NAME"
        assert actual[0].message.startswith(
            'Invalid environment variable name "BAD NAME": '
        )
        assert actual[0].message.endswith(".")

    def Should_ReportTypeOnly_When_MappingValueIsNotAString(self) -> None:
        # Act
        actual = _errors({"API_KEY": {"nested": "fictional-pasted-value"}})

        # Assert
        assert _pairs(actual) == [
            (
                "API_KEY",
                "API_KEY must map to a string secret path, not an object.",
            )
        ]

    @pytest.mark.parametrize(
        "value,expected",
        [
            (None, "null"),
            (True, "a boolean"),
            (5, "a number"),
            ([1], "an array"),
        ],
    )
    def Should_DescribeJsonType_When_MappingValueIsNotAString(
        self, value: object, expected: str
    ) -> None:
        # Act
        actual = _errors({"KEY": value})

        # Assert
        assert actual[0].message.endswith(f"not {expected}.")

    def Should_ReportReservedKey_When_UnknownDollarKeyIsPresent(self) -> None:
        # Act
        actual = _errors({"$other": "x"})

        # Assert
        assert _pairs(actual) == [
            (
                "$other",
                "$other is reserved: only $schema and $config may start"
                ' with "$".',
            )
        ]

    def Should_ReportConfigMustBeObject_When_ConfigIsNotAnObject(
        self,
    ) -> None:
        # Act
        actual = _errors({"$config": "aws"})

        # Assert
        assert _pairs(actual) == [("$config", "$config must be an object.")]

    def Should_ReportUnknownField_When_ConfigHasUnknownField(self) -> None:
        # Act
        actual = _errors({"$config": {"region": "eu"}})

        # Assert
        assert _pairs(actual) == [
            (
                "$config.region",
                "$config.region is not a known field. Allowed fields: "
                "provider, profile, vaultUrl, projectId, namespace, path, "
                "name, description, owner, environment.",
            )
        ]

    def Should_ReportMustBeString_When_ConfigFieldIsNotAString(self) -> None:
        # Act
        actual = _errors({"$config": {"profile": 1}})

        # Assert
        assert _pairs(actual) == [
            (
                "$config.profile",
                "$config.profile must be a string, not a number.",
            )
        ]

    def Should_ReportAbsoluteUri_When_SchemaIsNotAUri(self) -> None:
        # Act
        actual = _errors({"$schema": "not a uri"})

        # Assert
        assert _pairs(actual) == [
            ("$schema", "$schema must be an absolute URI.")
        ]

    def Should_ReportAbsoluteUri_When_VaultUrlIsNotAUri(self) -> None:
        # Arrange
        document = {"$config": {"provider": "azure", "vaultUrl": "my-vault"}}

        # Act
        actual = _errors(document)

        # Assert
        assert _pairs(actual) == [
            ("$config.vaultUrl", "$config.vaultUrl must be an absolute URI.")
        ]

    def Should_QuoteKey_When_KeyHasLineBreaks(self) -> None:
        # Act
        actual = _errors({"$bad\nkey": "x"})

        # Assert
        assert actual[0].message.startswith('"$bad\\nkey" is reserved')
        assert "\n" not in actual[0].message


class TestMapFileValidatorProviderRules:
    @pytest.mark.parametrize("provider", ["gcp", "hashicorp", "file"])
    def Should_ReportUnsupported_When_ProviderIsNotAwsOrAzure(
        self, provider: str
    ) -> None:
        # Act
        actual = _errors({"$config": {"provider": provider}})

        # Assert
        assert _pairs(actual) == [
            (
                "$config.provider",
                f"Unsupported provider: {provider}. "
                "Supported providers: aws, azure.",
            )
        ]

    def Should_ReportVaultUrlRequired_When_AzureHasNoVaultUrl(self) -> None:
        # Act
        actual = _errors({"$config": {"provider": "azure"}})

        # Assert
        assert _pairs(actual) == [
            (
                "$config.vaultUrl",
                "vaultUrl is required when using Azure provider. Set it in "
                "$config.vaultUrl in your map file or via with_vault_url().",
            )
        ]

    def Should_ReportProfileNotSupported_When_AzureHasProfile(self) -> None:
        # Arrange
        document = {
            "$config": {
                "provider": "azure",
                "vaultUrl": "https://v.vault.azure.net",
                "profile": "dev",
            }
        }

        # Act
        actual = _errors(document)

        # Assert
        assert _pairs(actual) == [
            (
                "$config.profile",
                "$config.profile is only supported with the aws provider "
                "(current provider: azure).",
            )
        ]

    def Should_ReportVaultUrlNotSupported_When_AwsHasVaultUrl(self) -> None:
        # Arrange
        document = {"$config": {"vaultUrl": "https://v.vault.azure.net"}}

        # Act
        actual = _errors(document)

        # Assert
        assert _pairs(actual) == [
            (
                "$config.vaultUrl",
                "$config.vaultUrl is only supported with the azure provider "
                "(current provider: aws).",
            )
        ]

    def Should_CompareProviderExactly_When_ConfigProviderHasOtherCase(
        self,
    ) -> None:
        # Act
        actual = _errors({"$config": {"provider": "AWS"}})

        # Assert
        assert _pairs(actual) == [
            (
                "$config.provider",
                "Unsupported provider: AWS. Supported providers: aws, azure.",
            )
        ]


class TestMapFileValidatorOverrides:
    def Should_NameOverrideMethod_When_ProviderOverrideIsUnsupported(
        self,
    ) -> None:
        # Arrange
        options = EnvilderOptions()
        options.provider = "GCP"  # type: ignore[assignment]

        # Act
        actual = _errors({}, options)

        # Assert
        assert _pairs(actual) == [
            (
                "with_provider()",
                "Unsupported provider: gcp. Supported providers: aws, azure.",
            )
        ]

    def Should_Pass_When_OverrideProvidesVaultUrlForAzure(self) -> None:
        # Arrange
        options = EnvilderOptions(
            provider=SecretProviderType.AZURE,
            vault_url="https://v.vault.azure.net",
        )

        # Act
        actual = _errors({}, options)

        # Assert
        assert actual == []

    def Should_UseOverrideProvider_When_ConfigNamesAnotherProvider(
        self,
    ) -> None:
        # Arrange
        document = {
            "$config": {
                "provider": "azure",
                "vaultUrl": "https://v.vault.azure.net",
            }
        }
        options = EnvilderOptions(provider=SecretProviderType.AWS)

        # Act
        actual = _errors(document, options)

        # Assert
        assert _pairs(actual) == [
            (
                "$config.vaultUrl",
                "$config.vaultUrl is only supported with the azure provider "
                "(current provider: aws).",
            )
        ]

    def Should_NameOverrideMethod_When_ProfileOverrideDoesNotFitAzure(
        self,
    ) -> None:
        # Arrange
        document = {
            "$config": {
                "provider": "azure",
                "vaultUrl": "https://v.vault.azure.net",
            }
        }
        options = EnvilderOptions(profile="dev")

        # Act
        actual = _errors(document, options)

        # Assert
        assert _pairs(actual) == [
            (
                "with_profile()",
                "with_profile() is only supported with the aws provider "
                "(current provider: azure).",
            )
        ]

    def Should_IgnoreOverride_When_ItIsBlank(self) -> None:
        # Arrange
        options = EnvilderOptions(profile="   ", vault_url="")

        # Act
        actual = _errors({"$config": {"provider": "azure"}}, options)

        # Assert
        assert [e.key for e in actual] == ["$config.vaultUrl"]
