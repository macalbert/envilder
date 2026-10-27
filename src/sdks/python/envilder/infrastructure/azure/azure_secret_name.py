"""Map a map-file reference to its Azure Key Vault secret name.

The only translation, shared with the envilder CLI: ``/`` becomes ``-``,
ignoring leading slashes, so a path-style reference such as
``/myapp/db/password`` reads ``myapp-db-password``. Anything else reaches Key
Vault as written, and a name it does not accept fails with Key Vault's own
error.

See https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
"""

from __future__ import annotations


def to_azure_secret_name(name: str) -> str:
    return name.lstrip("/").replace("/", "-")
