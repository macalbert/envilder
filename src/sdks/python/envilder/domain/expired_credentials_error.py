"""Detection and typed error for expired or invalid AWS credentials."""

from __future__ import annotations

import re

_EXPIRED_ERROR_CODES = {
    "ExpiredTokenException",
    "ExpiredToken",
    "UnrecognizedClient",
    "UnrecognizedClientException",
    "InvalidClientTokenId",
    "RequestExpired",
}

_EXPIRED_EXCEPTION_NAMES = {
    "NoCredentialsError",
    "TokenRetrievalError",
    "UnauthorizedSSOTokenError",
    "SSOTokenLoadError",
    "CredentialRetrievalError",
}

_MESSAGE_PATTERN = re.compile(
    r"expired|token has expired|sso session|refresh failed|"
    r"could not be refreshed|unable to locate credentials|"
    r"invalid.*security token|security token.*invalid",
    re.IGNORECASE,
)

_REMEDIATION = (
    "AWS credentials are expired or invalid. Your security token or SSO "
    "session may have expired. Refresh your credentials and retry "
    "(for SSO, run: aws sso login)."
)


class ExpiredCredentialsError(Exception):
    """Raised when AWS credentials or the security token are expired.

    Triggered when AWS rejects a request because the credentials or
    security token are expired or invalid (for example, an expired SSO
    session). The message includes remediation steps so callers can
    refresh their credentials and retry.

    Example::

        from envilder import Envilder, ExpiredCredentialsError

        try:
            Envilder.resolve_file("envilder.json")
        except ExpiredCredentialsError as error:
            print(error)  # explains how to refresh credentials and retry
    """

    def __init__(self) -> None:
        super().__init__(_REMEDIATION)


def is_expired_credentials_error(error: BaseException) -> bool:
    """Detect whether an exception is an expired/invalid AWS credential.

    Inspects the exception type name, a boto ``response`` error code, and
    the error message text.

    Args:
        error: The exception raised by a boto3/botocore call.

    Returns:
        ``True`` when the error indicates expired or invalid credentials.
    """
    if type(error).__name__ in _EXPIRED_EXCEPTION_NAMES:
        return True
    response = getattr(error, "response", None)
    if isinstance(response, dict):
        code = response.get("Error", {}).get("Code")
        if code in _EXPIRED_ERROR_CODES:
            return True
    return bool(_MESSAGE_PATTERN.search(str(error)))
