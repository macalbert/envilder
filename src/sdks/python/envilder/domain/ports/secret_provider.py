from __future__ import annotations

from typing import Protocol


class ISecretProvider(Protocol):
    """Abstraction for secret store access.

    Implement this protocol to add support for a custom secret
    provider (e.g. HashiCorp Vault, GCP Secret Manager).
    """

    def get_secret(self, name: str) -> str | None:
        """Retrieve a single secret by its provider-specific identifier.

        For AWS SSM this is the parameter path (e.g. ``/app/db-url``);
        for Azure Key Vault this is the secret name.

        Returns:
            The secret value, or ``None`` when the secret does not exist.
        """
        ...
