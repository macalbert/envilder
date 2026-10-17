from __future__ import annotations

from typing import Generator

import pytest
from azure.keyvault.secrets import SecretClient
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)

from containers.localstack_azure_container import LocalStackAzureContainer


@pytest.fixture(scope="session")
def localstack_azure_container() -> (
    Generator[LocalStackAzureContainer, None, None]
):
    container = LocalStackAzureContainer().start()
    yield container
    container.stop()


@pytest.fixture(scope="session")
def localstack_azure_vault_url(
    localstack_azure_container: LocalStackAzureContainer,
) -> str:
    return localstack_azure_container.vault_url


@pytest.fixture(scope="session")
def azure_secret_client(
    localstack_azure_container: LocalStackAzureContainer,
) -> SecretClient:
    return localstack_azure_container.create_secret_client()


@pytest.fixture(scope="session")
def azure_provider(
    localstack_azure_container: LocalStackAzureContainer,
) -> AzureKeyVaultSecretProvider:
    return localstack_azure_container.create_provider()
