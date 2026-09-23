"""Detection and typed error for expired or unresolved AWS SSO sessions."""

from __future__ import annotations

_SSO_SESSION_EXPIRED_EXCEPTION_NAMES = {
    "TokenRetrievalError",
    "UnauthorizedSSOTokenError",
    "SSOTokenLoadError",
}


def _build_message(profile_name: str | None) -> str:
    if profile_name:
        return (
            f"Your AWS SSO session for profile '{profile_name}' could not "
            f"be loaded or has expired. Run: aws sso login --profile "
            f"{profile_name} and then re-run this command."
        )
    return (
        "Your AWS SSO session could not be loaded or has expired. Run: "
        "aws sso login and then re-run this command."
    )


class SsoSessionExpiredError(Exception):
    """Raised when the AWS SSO session could not be loaded or has expired.

    Triggered when boto3 cannot resolve an SSO token for the active
    profile (for example, the cached SSO session expired). The message
    explains how to refresh the session with ``aws sso login`` and retry.
    When a profile is configured, the login hint is scoped to it.

    Example::

        from envilder import Envilder, SsoSessionExpiredError

        try:
            Envilder.resolve_file("envilder.json")
        except SsoSessionExpiredError as error:
            print(error)  # explains how to run aws sso login and retry
    """

    def __init__(self, profile_name: str | None = None) -> None:
        super().__init__(_build_message(profile_name))
        self.profile_name = profile_name


def is_sso_session_expired_error(error: BaseException) -> bool:
    """Detect whether an exception indicates an expired AWS SSO session.

    Relies only on the stable exception class name, mirroring the AWS
    token-resolution taxonomy. Message text is intentionally not
    inspected because its wording is unstable across SDK versions.

    Args:
        error: The exception raised by a boto3/botocore call.

    Returns:
        ``True`` when the error indicates an expired or unresolved SSO
        session.
    """
    return type(error).__name__ in _SSO_SESSION_EXPIRED_EXCEPTION_NAMES
