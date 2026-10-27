from __future__ import annotations

from azure.core.exceptions import ResourceNotFoundError
from azure.keyvault.secrets import SecretClient

from envilder.domain.ports.secret_provider import ISecretProvider
from envilder.infrastructure.azure.azure_secret_name import (
    to_azure_secret_name,
)


class AzureKeyVaultSecretProvider(ISecretProvider):
    """:class:`~envilder.ISecretProvider` backed by Azure Key Vault.

    Secrets that return HTTP 404 are treated as missing and yield ``None``.
    Each reference is mapped to its Key Vault name with
    :func:`to_azure_secret_name`, the same rule the CLI uses.
    """

    def __init__(self, secret_client: SecretClient) -> None:
        if secret_client is None:
            raise ValueError("secret_client cannot be None")
        self._secret_client = secret_client

    def get_secret(self, name: str) -> str | None:
        if not name or not name.strip():
            raise ValueError("Secret name cannot be null or empty.")

        secret_name = to_azure_secret_name(name)
        try:
            response = self._secret_client.get_secret(secret_name)
            value: str | None = response.value
            return value
        except ResourceNotFoundError:
            return None
