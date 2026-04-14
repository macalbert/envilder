from __future__ import annotations

from azure.core.exceptions import ResourceNotFoundError
from azure.keyvault.secrets import SecretClient

from envilder.domain.ports import ISecretProvider


class AzureKeyVaultSecretProvider(ISecretProvider):
    def __init__(self, secret_client: SecretClient) -> None:
        if secret_client is None:
            raise ValueError("secret_client cannot be None")
        self._secret_client = secret_client

    def get_secret(self, name: str) -> str | None:
        try:
            response = self._secret_client.get_secret(name)
            value: str | None = response.value
            return value
        except ResourceNotFoundError:
            return None
