from botocore.exceptions import (
    ClientError,
    SSOTokenLoadError,
    TokenRetrievalError,
    UnauthorizedSSOTokenError,
)
from envilder.domain.expired_credentials_error import (
    is_expired_credentials_error,
)


class TestIsExpiredCredentialsError:
    def Should_ReturnTrue_When_ClientErrorCodeIsExpiredToken(self) -> None:
        # Arrange
        error = ClientError(
            error_response={"Error": {"Code": "ExpiredToken"}},
            operation_name="GetParameter",
        )

        # Act
        actual = is_expired_credentials_error(error)

        # Assert
        assert actual is True

    def Should_ReturnTrue_When_ClientErrorCodeIsExpiredTokenException(
        self,
    ) -> None:
        # Arrange
        error = ClientError(
            error_response={"Error": {"Code": "ExpiredTokenException"}},
            operation_name="GetParameter",
        )

        # Act
        actual = is_expired_credentials_error(error)

        # Assert
        assert actual is True

    def Should_ReturnFalse_When_ErrorIsTokenRetrievalError(self) -> None:
        # Arrange
        error = TokenRetrievalError(provider="sso", error_msg="expired")

        # Act
        actual = is_expired_credentials_error(error)

        # Assert
        assert actual is False

    def Should_ReturnFalse_When_ErrorIsUnauthorizedSsoTokenError(
        self,
    ) -> None:
        # Arrange
        error = UnauthorizedSSOTokenError()

        # Act
        actual = is_expired_credentials_error(error)

        # Assert
        assert actual is False

    def Should_ReturnFalse_When_ErrorIsSsoTokenLoadError(self) -> None:
        # Arrange
        error = SSOTokenLoadError(error_msg="bad token")

        # Act
        actual = is_expired_credentials_error(error)

        # Assert
        assert actual is False
