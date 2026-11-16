from __future__ import annotations

from collections.abc import Collection, Mapping
from typing import TYPE_CHECKING

from botocore.exceptions import (
    BotoCoreError,
    ClientError,
    NoCredentialsError,
    PartialCredentialsError,
)

from envilder.domain.contract_validation_result import (
    SecretExistence,
    SecretExistenceStatus,
)
from envilder.domain.expired_credentials_error import (
    ExpiredCredentialsError,
    is_expired_credentials_error,
)
from envilder.domain.ports.secret_provider import ISecretProvider
from envilder.domain.sso_session_expired_error import (
    SsoSessionExpiredError,
    is_sso_session_expired_error,
)

if TYPE_CHECKING:
    from mypy_boto3_ssm import SSMClient

_SSM_BATCH_SIZE = 10

_AUTHENTICATION_ERROR_CODES = frozenset(
    {
        "UnrecognizedClientException",
        "InvalidClientTokenId",
        "InvalidSignatureException",
        "IncompleteSignatureException",
    }
)

# Errors that fail a whole ``GetParameters`` call because of one of its
# names, so each name is checked on its own to tell which one.
_PER_NAME_ERROR_CODES = frozenset(
    {"AccessDeniedException", "ValidationException"}
)


class AwsSsmSecretProvider(ISecretProvider):
    """:class:`~envilder.ISecretProvider` backed by AWS SSM Parameter Store.

    Parameters are retrieved with decryption enabled so that
    ``SecureString`` values are returned in plain text.
    """

    def __init__(
        self, ssm_client: SSMClient, profile: str | None = None
    ) -> None:
        if ssm_client is None:
            raise ValueError("ssm_client cannot be None")
        self._ssm_client = ssm_client
        self._profile = profile

    def get_secret(self, name: str) -> str | None:
        if not name or not name.strip():
            raise ValueError("Secret name cannot be null or whitespace.")

        try:
            response = self._ssm_client.get_parameter(
                Name=name, WithDecryption=True
            )
            param = response.get("Parameter")
            value = param.get("Value") if param else None
            return str(value) if value is not None else None
        except ClientError as e:
            error = e.response.get("Error", {})
            if error.get("Code") == "ParameterNotFound":
                return None
            if is_sso_session_expired_error(e):
                raise SsoSessionExpiredError(self._profile) from e
            if is_expired_credentials_error(e):
                raise ExpiredCredentialsError() from e
            raise
        except BotoCoreError as e:
            if is_sso_session_expired_error(e):
                raise SsoSessionExpiredError(self._profile) from e
            if is_expired_credentials_error(e):
                raise ExpiredCredentialsError() from e
            raise

    def check_secrets_exist(
        self, names: Collection[str]
    ) -> Mapping[str, SecretExistence]:
        """Check that parameters exist without reading their values.

        Uses ``GetParameters`` in batches of 10 with ``WithDecryption`` off:
        the names it cannot find come back in ``InvalidParameters``, and the
        values it returns are never read. Needs ``ssm:GetParameters`` on the
        parameters.
        """
        results: dict[str, SecretExistence] = {}
        distinct = list(dict.fromkeys(names))
        for start in range(0, len(distinct), _SSM_BATCH_SIZE):
            batch = distinct[start : start + _SSM_BATCH_SIZE]
            results.update(self._check_batch(batch))
        return results

    def _check_batch(self, batch: list[str]) -> dict[str, SecretExistence]:
        try:
            response = self._ssm_client.get_parameters(
                Names=batch, WithDecryption=False
            )
        except (ClientError, BotoCoreError) as e:
            if len(batch) > 1 and _error_code(e) in _PER_NAME_ERROR_CODES:
                results: dict[str, SecretExistence] = {}
                for name in batch:
                    results.update(self._check_batch([name]))
                return results
            existence = self._to_existence(e)
            return {name: existence for name in batch}

        missing = set(response.get("InvalidParameters", []))
        return {
            name: SecretExistence(
                SecretExistenceStatus.MISSING
                if name in missing
                else SecretExistenceStatus.EXISTS
            )
            for name in batch
        }

    def _to_existence(self, error: BaseException) -> SecretExistence:
        # Expired credentials are a credentials problem: reported, not raised,
        # with the same remediation a load gives.
        if is_sso_session_expired_error(error):
            return SecretExistence(
                SecretExistenceStatus.AUTHENTICATION_FAILED,
                str(SsoSessionExpiredError(self._profile)),
            )
        if is_expired_credentials_error(error):
            return SecretExistence(
                SecretExistenceStatus.AUTHENTICATION_FAILED,
                str(ExpiredCredentialsError()),
            )
        reason = str(error) or type(error).__name__
        code = _error_code(error)
        if code == "AccessDeniedException":
            status = SecretExistenceStatus.ACCESS_DENIED
        elif code in _AUTHENTICATION_ERROR_CODES or isinstance(
            error, (NoCredentialsError, PartialCredentialsError)
        ):
            status = SecretExistenceStatus.AUTHENTICATION_FAILED
        else:
            status = SecretExistenceStatus.PROVIDER_ERROR
        return SecretExistence(status, reason)


def _error_code(error: BaseException) -> str:
    response = getattr(error, "response", None)
    if isinstance(response, dict):
        return str(response.get("Error", {}).get("Code", ""))
    return ""
