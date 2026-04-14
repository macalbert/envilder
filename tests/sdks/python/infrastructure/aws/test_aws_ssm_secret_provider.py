from unittest.mock import Mock

import pytest
from botocore.exceptions import ClientError
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)


class TestAwsSsmSecretProvider:
    def Should_ReturnSecret_When_AwsSsmParameterExists(
        self,
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameter.return_value = {
            "Parameter": {"Value": "secret-value-123"}
        }
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.get_secret("/Test/Token")

        # Assert
        assert actual == "secret-value-123"
        ssm_client.get_parameter.assert_called_once_with(
            Name="/Test/Token", WithDecryption=True
        )

    def Should_ReturnNone_When_AwsSsmParameterNotFound(
        self,
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameter.side_effect = ClientError(
            error_response={"Error": {"Code": "ParameterNotFound"}},
            operation_name="GetParameter",
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.get_secret("/Test/NonExistent")

        # Assert
        assert actual is None
        ssm_client.get_parameter.assert_called_once()

    def Should_RaiseValueError_When_NameIsEmpty(self) -> None:
        # Arrange
        ssm_client = Mock()
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        action = lambda: sut.get_secret("")

        # Assert
        with pytest.raises(ValueError, match="cannot be null"):
            action()

    def Should_ReraisClientError_When_NotParameterNotFound(
        self,
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameter.side_effect = ClientError(
            error_response={"Error": {"Code": "AccessDeniedException"}},
            operation_name="GetParameter",
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        action = lambda: sut.get_secret("/Test/Forbidden")

        # Assert
        with pytest.raises(ClientError):
            action()
