from unittest.mock import Mock

import pytest
from botocore.exceptions import ClientError, TokenRetrievalError

from envilder.domain.expired_credentials_error import ExpiredCredentialsError
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)


class TestExpiredCredentials:
    def Should_RaiseExpiredCredentialsError_When_ClientErrorIsExpiredToken(
        self,
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameter.side_effect = ClientError(
            error_response={
                "Error": {
                    "Code": "ExpiredTokenException",
                    "Message": (
                        "The security token included in the request " "is expired"
                    ),
                }
            },
            operation_name="GetParameter",
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        action = lambda: sut.get_secret("/Test/Token")

        # Assert
        with pytest.raises(ExpiredCredentialsError, match="aws sso login"):
            action()

    def Should_RaiseExpiredCredentialsError_When_BotoCredentialErrorOccurs(
        self,
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameter.side_effect = TokenRetrievalError(
            provider="sso",
            error_msg="Token has expired and refresh failed",
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        action = lambda: sut.get_secret("/Test/Token")

        # Assert
        with pytest.raises(ExpiredCredentialsError):
            action()

    def Should_ReturnNone_When_ParameterNotFound(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameter.side_effect = ClientError(
            error_response={"Error": {"Code": "ParameterNotFound"}},
            operation_name="GetParameter",
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.get_secret("/Test/Missing")

        # Assert
        assert actual is None

    def Should_ReraiseOriginalError_When_ClientErrorIsUnrelated(
        self,
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameter.side_effect = ClientError(
            error_response={
                "Error": {"Code": "InternalServerError", "Message": "boom"}
            },
            operation_name="GetParameter",
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        action = lambda: sut.get_secret("/Test/Boom")

        # Assert
        with pytest.raises(ClientError):
            action()
