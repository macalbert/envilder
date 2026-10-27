"""Map a map-file reference to its Azure Key Vault secret name.

Uses the same rule as the envilder CLI so every surface reads the same
secret. A name Azure already accepts (1-127 letters, digits and hyphens) is
used as written: ``Database--Password``, ``1password-token``. Only a name
Azure would reject is rewritten, the way the CLI has always stored such
secrets: ``/myapp/db_password`` becomes ``myapp-db-password``.

See https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
"""

from __future__ import annotations

import re

_AZURE_SECRET_NAME = re.compile(r"[0-9A-Za-z-]{1,127}")
_UNSUPPORTED_CHARACTER = re.compile(r"[^a-zA-Z0-9\-_/]")
_MAX_LENGTH = 127


def to_azure_secret_name(name: str) -> str:
    if _UNSUPPORTED_CHARACTER.search(name):
        raise ValueError(
            f"Invalid secret name '{name}': contains characters not allowed "
            "by Azure Key Vault. Only alphanumeric characters, hyphens, "
            "slashes, and underscores are accepted."
        )
    if _AZURE_SECRET_NAME.fullmatch(name):
        return name

    normalized = _normalize(name)
    if len(normalized) > _MAX_LENGTH:
        raise ValueError(
            f"Invalid secret name '{name}': normalized name '{normalized}' "
            f"exceeds the {_MAX_LENGTH}-character limit for Azure Key Vault."
        )
    return normalized


def _normalize(name: str) -> str:
    normalized = re.sub(r"^/+", "", name)
    normalized = re.sub(r"[/_]", "-", normalized).lower()
    normalized = re.sub(r"-+", "-", normalized).strip("-")
    if normalized and not re.match(r"[a-z]", normalized):
        normalized = f"secret-{normalized}"
    return normalized or "secret"
