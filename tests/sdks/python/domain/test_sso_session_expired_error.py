from botocore.exceptions import (
    ClientError,
    SSOTokenLoadError,
    TokenRetrievalError,
    UnauthorizedSSOTokenError,
)
from envilder.domain.sso_session_expired_error import (
    SsoSessionExpiredError,
    is_sso_session_expired_error,
)


class TestSsoSessionExpiredError:
    def Should_IncludeProfileScopedLoginHint_When_ProfileNameProvided(
        self,
    ) -> None:
        # Arrange
        profile_name = "staging"

        # Act
        actual = SsoSessionExpiredError(profile_name)

        # Assert
        assert "aws sso login --profile staging" in str(actual)

    def Should_IncludeBareLoginHint_When_ProfileNameMissing(self) -> None:
        # Act
        actual = SsoSessionExpiredError()

        # Assert
        assert "aws sso login" in str(actual)
        assert "--profile" not in str(actual)

    def Should_StoreProfileName_When_ProfileNameProvided(self) -> None:
        # Arrange
        profile_name = "prod"

        # Act
        actual = SsoSessionExpiredError(profile_name)

        # Assert
        assert actual.profile_name == "prod"

    def Should_StoreNoneProfileName_When_ProfileNameMissing(self) -> None:
        # Act
        actual = SsoSessionExpiredError()

        # Assert
        assert actual.profile_name is None


class TestIsSsoSessionExpiredError:
    def Should_ReturnTrue_When_ErrorIsTokenRetrievalError(self) -> None:
        # Arrange
        error = TokenRetrievalError(provider="sso", error_msg="expired")

        # Act
        actual = is_sso_session_expired_error(error)

        # Assert
        assert actual is True

    def Should_ReturnTrue_When_ErrorIsUnauthorizedSsoTokenError(self) -> None:
        # Arrange
        error = UnauthorizedSSOTokenError()

        # Act
        actual = is_sso_session_expired_error(error)

        # Assert
        assert actual is True

    def Should_ReturnTrue_When_ErrorIsSsoTokenLoadError(self) -> None:
        # Arrange
        error = SSOTokenLoadError(error_msg="bad token")

        # Act
        actual = is_sso_session_expired_error(error)

        # Assert
        assert actual is True

    def Should_ReturnFalse_When_ErrorIsExpiredTokenClientError(self) -> None:
        # Arrange
        error = ClientError(
            error_response={"Error": {"Code": "ExpiredToken"}},
            operation_name="GetParameter",
        )

        # Act
        actual = is_sso_session_expired_error(error)

        # Assert
        assert actual is False

    def Should_ReturnFalse_When_ErrorIsUnrelated(self) -> None:
        # Arrange
        error = ValueError("nope")

        # Act
        actual = is_sso_session_expired_error(error)

        # Assert
        assert actual is False
