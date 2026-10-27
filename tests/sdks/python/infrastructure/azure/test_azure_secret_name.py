import pytest
from envilder.infrastructure.azure.azure_secret_name import (
    to_azure_secret_name,
)


# The same cases are pinned in the CLI, Node.js and .NET tests: every surface
# must resolve a map-file reference to the same Key Vault secret.
class TestToAzureSecretName:
    @pytest.mark.parametrize(
        "name",
        [
            "MY-SECRET-NAME",
            "Database--Password",
            "1password-token",
            "-edge-hyphens-",
            "a" * 127,
        ],
    )
    def Should_KeepNameAsWritten_When_NameIsValidForAzure(
        self, name: str
    ) -> None:
        # Act
        actual = to_azure_secret_name(name)

        # Assert
        assert actual == name

    @pytest.mark.parametrize(
        ("name", "expected"),
        [
            ("/myapp/db_password", "myapp-db-password"),
            ("/MY/SECRET_NAME", "my-secret-name"),
            ("db__url", "db-url"),
            ("/123/test", "secret-123-test"),
            ("/", "secret"),
        ],
    )
    def Should_NormalizeLikeTheCli_When_NameIsInvalidForAzure(
        self, name: str, expected: str
    ) -> None:
        # Act
        actual = to_azure_secret_name(name)

        # Assert
        assert actual == expected

    @pytest.mark.parametrize("name", ["db.url", "db url", "db:url"])
    def Should_Raise_When_NameHasCharactersAzureCannotHold(
        self, name: str
    ) -> None:
        # Act
        def action() -> str:
            return to_azure_secret_name(name)

        # Assert
        with pytest.raises(ValueError, match="not allowed by Azure Key Vault"):
            action()

    def Should_Raise_When_NormalizedNameExceedsLimit(self) -> None:
        # Arrange
        name = "a" * 127 + "_x"

        # Act
        def action() -> str:
            return to_azure_secret_name(name)

        # Assert
        with pytest.raises(ValueError, match="127-character limit"):
            action()
