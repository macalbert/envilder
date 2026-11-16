from unittest.mock import Mock

import pytest
from azure.core.exceptions import (
    ClientAuthenticationError,
    HttpResponseError,
    ServiceRequestError,
)
from azure.identity import CredentialUnavailableError
from envilder.domain.contract_validation_result import SecretExistenceStatus
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)


def _properties(name: str, enabled: bool | None = True) -> Mock:
    properties = Mock()
    properties.name = name
    properties.enabled = enabled
    return properties


def _http_error(status_code: int) -> HttpResponseError:
    response = Mock()
    response.status_code = status_code
    response.reason = "reason"
    return HttpResponseError(response=response)


class TestAzureCheckSecretsExist:
    def Should_ReportExistsAndMissing_When_VaultListsSomeSecrets(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.return_value = [
            _properties("app-db")
        ]
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db", "/app/key"])

        # Assert
        assert actual["/app/db"].status is SecretExistenceStatus.EXISTS
        assert actual["/app/key"].status is SecretExistenceStatus.MISSING

    def Should_ListSecretsOnce_When_ManyNamesAreChecked(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.return_value = []
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        sut.check_secrets_exist(["a", "b", "c"])

        # Assert
        secret_client.list_properties_of_secrets.assert_called_once_with()
        secret_client.get_secret.assert_not_called()

    def Should_MatchIgnoringCase_When_NameDiffersByCase(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.return_value = [
            _properties("My-Secret")
        ]
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["/my/secret"])

        # Assert
        assert actual["/my/secret"].status is SecretExistenceStatus.EXISTS

    def Should_ReportMissing_When_SecretIsDisabled(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.return_value = [
            _properties("app-db", enabled=False)
        ]
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert actual["/app/db"].status is SecretExistenceStatus.MISSING

    def Should_TreatUnsetEnabledAsEnabled_When_PropertyIsNone(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.return_value = [
            _properties("app-db", enabled=None)
        ]
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["/app/db"])

        # Assert
        assert actual["/app/db"].status is SecretExistenceStatus.EXISTS

    def Should_NotCallVault_When_NoNamesAreGiven(self) -> None:
        # Arrange
        secret_client = Mock()
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist([])

        # Assert
        assert actual == {}
        secret_client.list_properties_of_secrets.assert_not_called()

    def Should_ReportAccessDeniedNotMissing_When_VaultReturns403(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.side_effect = _http_error(403)
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["a", "b"])

        # Assert
        assert {e.status for e in actual.values()} == {
            SecretExistenceStatus.ACCESS_DENIED
        }

    def Should_ReportAccessDenied_When_403IsAClientAuthenticationError(
        self,
    ) -> None:
        # Arrange
        response = Mock()
        response.status_code = 403
        response.reason = "Forbidden"
        secret_client = Mock()
        secret_client.list_properties_of_secrets.side_effect = (
            ClientAuthenticationError(response=response)
        )
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["a"])

        # Assert
        assert actual["a"].status is SecretExistenceStatus.ACCESS_DENIED

    def Should_ReportAuthenticationFailed_When_VaultReturns401(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.side_effect = _http_error(401)
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["a"])

        # Assert
        assert (
            actual["a"].status is SecretExistenceStatus.AUTHENTICATION_FAILED
        )

    @pytest.mark.parametrize(
        "error",
        [
            ClientAuthenticationError(message="rejected"),
            CredentialUnavailableError(message="no credential"),
        ],
    )
    def Should_ReportAuthenticationFailed_When_CredentialCannotAuthenticate(
        self, error: Exception
    ) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.side_effect = error
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["a"])

        # Assert
        assert (
            actual["a"].status is SecretExistenceStatus.AUTHENTICATION_FAILED
        )
        assert actual["a"].reason

    def Should_ReportProviderError_When_VaultIsUnreachable(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.side_effect = (
            ServiceRequestError("cannot connect")
        )
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["a"])

        # Assert
        assert actual["a"].status is SecretExistenceStatus.PROVIDER_ERROR
        assert actual["a"].reason == "cannot connect"

    def Should_ReportProviderError_When_VaultReturns500(self) -> None:
        # Arrange
        secret_client = Mock()
        secret_client.list_properties_of_secrets.side_effect = _http_error(500)
        sut = AzureKeyVaultSecretProvider(secret_client)

        # Act
        actual = sut.check_secrets_exist(["a"])

        # Assert
        assert actual["a"].status is SecretExistenceStatus.PROVIDER_ERROR
