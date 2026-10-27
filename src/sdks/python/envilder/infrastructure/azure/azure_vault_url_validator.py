from __future__ import annotations

from collections.abc import Sequence
from urllib.parse import urlparse

DEFAULT_VAULT_HOSTS: tuple[str, ...] = (
    ".vault.azure.net",
    ".vault.azure.cn",
    ".vault.usgovcloudapi.net",
    ".vault.microsoftazure.de",
)


def validate_azure_vault_url(
    vault_url: str,
    allowed_hosts: Sequence[str],
) -> str:
    """Check *vault_url* before any credential is sent to it.

    Returns the URL's hostname. Raises ``ValueError`` when the URL is
    not ``https://`` or its hostname does not end with one of
    *allowed_hosts*.
    """
    try:
        parsed = urlparse(vault_url)
        hostname = parsed.hostname
    except ValueError as e:
        raise ValueError("vaultUrl must be a valid URL") from e

    if parsed.scheme != "https":
        raise ValueError("vaultUrl must use https:// protocol")

    if not hostname:
        raise ValueError("vaultUrl must be a valid URL")

    if "@" in parsed.netloc or "\\" in vault_url:
        raise ValueError("vaultUrl must not contain user information")

    if not is_allowed_vault_host(hostname, allowed_hosts):
        raise ValueError(
            "vaultUrl hostname must end with one of: "
            f"{', '.join(allowed_hosts)}"
        )

    return hostname


def is_allowed_vault_host(hostname: str, allowed_hosts: Sequence[str]) -> bool:
    host = hostname.lower()
    for suffix in allowed_hosts:
        normalized = suffix.strip().lstrip(".").lower()
        if not normalized:
            continue
        if host == normalized or host.endswith(f".{normalized}"):
            return True
    return False
