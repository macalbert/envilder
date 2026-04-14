from __future__ import annotations

from typing import Generator

import pytest
from azure.keyvault.secrets import SecretClient
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)

from containers.lowkey_vault_container import LowkeyVaultContainer


@pytest.fixture(scope="session")
def lowkey_vault_container() -> Generator[LowkeyVaultContainer, None, None]:
    container = LowkeyVaultContainer().start()
    yield container
    container.stop()


@pytest.fixture(scope="session")
def lowkey_vault_url(
    lowkey_vault_container: LowkeyVaultContainer,
) -> str:
    return lowkey_vault_container.vault_url


@pytest.fixture(scope="session")
def azure_secret_client(
    lowkey_vault_container: LowkeyVaultContainer,
) -> SecretClient:
    return lowkey_vault_container.create_secret_client()


@pytest.fixture(scope="session")
def azure_provider(
    lowkey_vault_container: LowkeyVaultContainer,
) -> AzureKeyVaultSecretProvider:
    return lowkey_vault_container.create_provider()
