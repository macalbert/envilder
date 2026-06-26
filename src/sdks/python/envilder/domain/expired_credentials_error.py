"""Detection and typed error for expired or invalid AWS credentials."""

from __future__ import annotations

_EXPIRED_ERROR_CODES = {
    "ExpiredTokenException",
    "ExpiredToken",
}

_EXPIRED_EXCEPTION_NAMES = {
    "TokenRetrievalError",
    "UnauthorizedSSOTokenError",
    "SSOTokenLoadError",
}

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

    Relies only on stable, structured signals: the exception class name
    and the boto ``response`` error code. Message text is intentionally
    not inspected because its wording is unstable across SDK versions.

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
    return False
