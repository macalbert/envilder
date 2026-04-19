import pytest
from envilder.application.secret_validation import (
    SecretValidationError,
    validate_secrets,
)


class TestValidateSecrets:
    def Should_NotRaise_When_AllValuesArePresent(self) -> None:
        # Arrange
        secrets = {
            "DB_URL": "postgres://localhost",
            "API_KEY": "sk-123",
        }

        # Act
        act = lambda: validate_secrets(secrets)

        # Assert
        act()

    def Should_Raise_When_AnyValueIsEmpty(self) -> None:
        # Arrange
        secrets = {
            "DB_URL": "postgres://localhost",
            "API_KEY": "",
        }

        # Act
        act = lambda: validate_secrets(secrets)

        # Assert
        with pytest.raises(SecretValidationError) as exc_info:
            act()
        assert exc_info.value.missing_keys == ["API_KEY"]

    def Should_Raise_When_DictionaryIsEmpty(self) -> None:
        # Arrange
        secrets: dict[str, str] = {}

        # Act
        act = lambda: validate_secrets(secrets)

        # Assert
        with pytest.raises(SecretValidationError) as exc_info:
            act()
        assert exc_info.value.missing_keys == []

    def Should_Raise_When_MultipleValuesAreEmptyOrWhitespace(
        self,
    ) -> None:
        # Arrange
        secrets = {
            "DB_URL": "postgres://localhost",
            "API_KEY": "",
            "SECRET": "   ",
        }

        # Act
        act = lambda: validate_secrets(secrets)

        # Assert
        with pytest.raises(SecretValidationError) as exc_info:
            act()
        assert sorted(exc_info.value.missing_keys) == [
            "API_KEY",
            "SECRET",
        ]

    def Should_IncludeKeyNamesInMessage_When_ValidationFails(
        self,
    ) -> None:
        # Arrange
        secrets = {"MY_TOKEN": ""}

        # Act
        act = lambda: validate_secrets(secrets)

        # Assert
        with pytest.raises(SecretValidationError, match="MY_TOKEN"):
            act()

    def Should_RaiseTypeError_When_SecretsIsNone(self) -> None:
        # Arrange
        secrets = None

        # Act
        act = lambda: validate_secrets(secrets)  # type: ignore[arg-type]

        # Assert
        with pytest.raises(TypeError):
            act()
