import ssl

import pytest
import requests
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)
from testcontainers.core.container import DockerContainer
from testcontainers.core.waiting_utils import wait_for_logs


class _TrustAllSession(requests.Session):
    def __init__(self):
        super().__init__()
        self.verify = False


@pytest.fixture(scope="session")
def lowkey_vault_container():
    container = (
        DockerContainer("nagyesta/lowkey-vault:7.1.32")
        .with_exposed_ports(8443, 8080)
        .with_env(
            "LOWKEY_ARGS",
            "--server.port=8443 --LOWKEY_VAULT_RELAXED_PORTS=true",
        )
    )
    with container:
        wait_for_logs(container, "Started LowkeyVaultApp")
        yield container


@pytest.fixture(scope="session")
def lowkey_vault_url(lowkey_vault_container):
    host = lowkey_vault_container.get_container_host_ip()
    port = lowkey_vault_container.get_exposed_port(8443)
    return f"https://{host}:{port}"


@pytest.fixture(scope="session")
def lowkey_vault_token_url(lowkey_vault_container):
    host = lowkey_vault_container.get_container_host_ip()
    port = lowkey_vault_container.get_exposed_port(8080)
    return f"http://{host}:{port}" "/metadata/identity/oauth2/token"


@pytest.fixture(scope="session")
def azure_secret_client(
    lowkey_vault_url, lowkey_vault_token_url, monkeypatch_session
):
    import os

    os.environ["IDENTITY_ENDPOINT"] = lowkey_vault_token_url
    os.environ["IDENTITY_HEADER"] = "dummy"

    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    client = SecretClient(
        vault_url=lowkey_vault_url,
        credential=DefaultAzureCredential(),
        connection_verify=False,
        verify_challenge_resource=False,
    )

    yield client

    os.environ.pop("IDENTITY_ENDPOINT", None)
    os.environ.pop("IDENTITY_HEADER", None)


@pytest.fixture(scope="session")
def azure_provider(azure_secret_client):
    return AzureKeyVaultSecretProvider(azure_secret_client)


@pytest.fixture(scope="session")
def monkeypatch_session():
    from _pytest.monkeypatch import MonkeyPatch

    m = MonkeyPatch()
    yield m
    m.undo()
