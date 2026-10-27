import pytest
from envilder.infrastructure.azure.azure_secret_name import (
    to_azure_secret_name,
)


# The same cases are pinned in the CLI, Node.js and .NET tests: every surface
# must send Key Vault the same secret name.
class TestToAzureSecretName:
    @pytest.mark.parametrize(
        "name",
        [
            "MY-SECRET-NAME",
            "Database--Password",
            "1password-token",
            "my_secret_name",
            "db.url",
        ],
    )
    def Should_PassNameAsWritten_When_NameHasNoSlash(self, name: str) -> None:
        # Act
        actual = to_azure_secret_name(name)

        # Assert
        assert actual == name

    @pytest.mark.parametrize(
        ("name", "expected"),
        [
            ("/myapp/db/password", "myapp-db-password"),
            ("myapp/db_password", "myapp-db_password"),
            ("/MyApp/Db", "MyApp-Db"),
            ("//a//b", "a--b"),
        ],
    )
    def Should_TurnSlashesIntoHyphens_When_NameHasSlashes(
        self, name: str, expected: str
    ) -> None:
        # Act
        actual = to_azure_secret_name(name)

        # Assert
        assert actual == expected
