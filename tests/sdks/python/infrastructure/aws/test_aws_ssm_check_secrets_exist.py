from unittest.mock import Mock

import pytest
from botocore.exceptions import (
    ClientError,
    EndpointConnectionError,
    NoCredentialsError,
    PartialCredentialsError,
    TokenRetrievalError,
)
from envilder.domain.contract_validation_result import (
    SecretExistence,
    SecretExistenceStatus,
)
from envilder.domain.expired_credentials_error import ExpiredCredentialsError
from envilder.domain.sso_session_expired_error import SsoSessionExpiredError
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)


def _client_error(code: str, operation: str = "GetParameters") -> ClientError:
    return ClientError(
        error_response={"Error": {"Code": code, "Message": f"{code} text"}},
        operation_name=operation,
    )


class TestAwsSsmCheckSecretsExist:
    def Should_ReportExists_When_ParameterIsFound(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.return_value = {
            "Parameters": [{"Name": "/app/db", "Value": "fictional-value"}],
            "InvalidParameters": [],
        }
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert actual == {
            "/app/db": SecretExistence(SecretExistenceStatus.EXISTS)
        }

    def Should_ReportMissing_When_ParameterIsInvalid(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.return_value = {
            "Parameters": [{"Name": "/app/db", "Value": "fictional-value"}],
            "InvalidParameters": ["/app/key"],
        }
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db", "/app/key"])

        # Assert
        assert actual["/app/db"].status is SecretExistenceStatus.EXISTS
        assert actual["/app/key"].status is SecretExistenceStatus.MISSING

    def Should_NeverDecryptValues_When_CheckingExistence(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.return_value = {"InvalidParameters": []}
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        sut.check_secrets_exist(["/app/db"])

        # Assert
        ssm_client.get_parameters.assert_called_once_with(
            Names=["/app/db"], WithDecryption=False
        )

    def Should_CallInBatchesOfTen_When_MoreThanTenNames(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.return_value = {"InvalidParameters": []}
        names = [f"/app/p{i}" for i in range(23)]
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(names)

        # Assert
        batches = [
            call.kwargs["Names"]
            for call in ssm_client.get_parameters.call_args_list
        ]
        assert [len(batch) for batch in batches] == [10, 10, 3]
        assert len(actual) == 23

    def Should_CheckDuplicateNamesOnce_When_NamesRepeat(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.return_value = {"InvalidParameters": []}
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        sut.check_secrets_exist(["/app/a", "/app/a"])

        # Assert
        ssm_client.get_parameters.assert_called_once_with(
            Names=["/app/a"], WithDecryption=False
        )

    @pytest.mark.parametrize(
        "code", ["AccessDeniedException", "ValidationException"]
    )
    def Should_RetryEachNameAlone_When_BatchFailsBecauseOfOneName(
        self, code: str
    ) -> None:
        # Arrange
        ssm_client = Mock()

        def get_parameters(Names: list[str], WithDecryption: bool):
            if len(Names) > 1:
                raise _client_error(code)
            if Names == ["/app/denied"]:
                raise _client_error("AccessDeniedException")
            return {"InvalidParameters": []}

        ssm_client.get_parameters.side_effect = get_parameters
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/ok", "/app/denied"])

        # Assert
        assert actual["/app/ok"].status is SecretExistenceStatus.EXISTS
        assert (
            actual["/app/denied"].status is SecretExistenceStatus.ACCESS_DENIED
        )

    def Should_ReportAccessDeniedNotMissing_When_SingleNameIsDenied(
        self,
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.side_effect = _client_error(
            "AccessDeniedException"
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert actual["/app/db"].status is SecretExistenceStatus.ACCESS_DENIED
        assert actual["/app/db"].reason
        assert ssm_client.get_parameters.call_count == 1

    @pytest.mark.parametrize(
        "code",
        [
            "UnrecognizedClientException",
            "InvalidClientTokenId",
            "InvalidSignatureException",
            "IncompleteSignatureException",
        ],
    )
    def Should_ReportAuthenticationFailed_When_CredentialsAreRejected(
        self, code: str
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.side_effect = _client_error(code)
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/a", "/app/b"])

        # Assert
        assert {e.status for e in actual.values()} == {
            SecretExistenceStatus.AUTHENTICATION_FAILED
        }
        assert ssm_client.get_parameters.call_count == 1

    @pytest.mark.parametrize(
        "error",
        [
            NoCredentialsError(),
            PartialCredentialsError(
                provider="env", cred_var="AWS_SECRET_ACCESS_KEY"
            ),
        ],
    )
    def Should_ReportAuthenticationFailed_When_NoCredentialsAreAvailable(
        self, error: Exception
    ) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.side_effect = error
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert (
            actual["/app/db"].status
            is SecretExistenceStatus.AUTHENTICATION_FAILED
        )

    def Should_ReportRemediationAsReason_When_SsoSessionExpired(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.side_effect = TokenRetrievalError(
            provider="sso", error_msg="expired"
        )
        sut = AwsSsmSecretProvider(ssm_client, profile="dev")

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert (
            actual["/app/db"].status
            is SecretExistenceStatus.AUTHENTICATION_FAILED
        )
        assert actual["/app/db"].reason == str(SsoSessionExpiredError("dev"))

    def Should_ReportRemediationAsReason_When_TokenIsExpired(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.side_effect = _client_error(
            "ExpiredTokenException"
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert (
            actual["/app/db"].status
            is SecretExistenceStatus.AUTHENTICATION_FAILED
        )
        assert actual["/app/db"].reason == str(ExpiredCredentialsError())

    def Should_ReportProviderError_When_EndpointIsUnreachable(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.side_effect = EndpointConnectionError(
            endpoint_url="https://ssm.example.invalid"
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert actual["/app/db"].status is SecretExistenceStatus.PROVIDER_ERROR
        assert "ssm.example.invalid" in (actual["/app/db"].reason or "")

    def Should_ReportProviderError_When_ServiceFailsUnexpectedly(self) -> None:
        # Arrange
        ssm_client = Mock()
        ssm_client.get_parameters.side_effect = _client_error(
            "InternalServerError"
        )
        sut = AwsSsmSecretProvider(ssm_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert actual["/app/db"].status is SecretExistenceStatus.PROVIDER_ERROR
