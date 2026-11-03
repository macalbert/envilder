from __future__ import annotations

from collections.abc import Collection, Mapping

from azure.core.exceptions import (
    ClientAuthenticationError,
    HttpResponseError,
    ResourceNotFoundError,
)
from azure.keyvault.secrets import SecretClient

from envilder.domain.contract_validation_result import (
    SecretExistence,
    SecretExistenceStatus,
)
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

    def check_secrets_exist(
        self, names: Collection[str]
    ) -> Mapping[str, SecretExistence]:
        """Check that secrets exist without reading their values.

        Lists the vault's secret properties once, which reads metadata only,
        and matches every name against it the way Key Vault does, ignoring
        case. A disabled secret cannot be read, so it counts as missing.
        Needs the ``List`` secret permission (access policies) or
        ``Microsoft.KeyVault/vaults/secrets/readMetadata/action`` (Azure
        RBAC, included in Key Vault Secrets User).
        """
        distinct = list(dict.fromkeys(names))
        if not distinct:
            return {}

        try:
            enabled = self._list_enabled_secret_names()
        except Exception as e:
            existence = _to_existence(e)
            return {name: existence for name in distinct}

        return {
            name: SecretExistence(
                SecretExistenceStatus.EXISTS
                if to_azure_secret_name(name).lower() in enabled
                else SecretExistenceStatus.MISSING
            )
            for name in distinct
        }

    def _list_enabled_secret_names(self) -> set[str]:
        enabled: set[str] = set()
        for properties in self._secret_client.list_properties_of_secrets():
            if properties.enabled is not False and properties.name:
                enabled.add(properties.name.lower())
        return enabled


def _to_existence(error: Exception) -> SecretExistence:
    reason = str(error) or type(error).__name__
    # 403 first: a ClientAuthenticationError is also an HttpResponseError.
    status_code = (
        error.status_code if isinstance(error, HttpResponseError) else None
    )
    if status_code == 403:
        status = SecretExistenceStatus.ACCESS_DENIED
    elif status_code == 401 or isinstance(error, ClientAuthenticationError):
        status = SecretExistenceStatus.AUTHENTICATION_FAILED
    else:
        status = SecretExistenceStatus.PROVIDER_ERROR
    return SecretExistence(status, reason)
