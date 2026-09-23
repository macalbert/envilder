from __future__ import annotations

from typing import TYPE_CHECKING

from botocore.exceptions import BotoCoreError, ClientError

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
