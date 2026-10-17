from __future__ import annotations

import os
import socket
import uuid
from typing import Any

import requests
from azure.identity import ClientSecretCredential, DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)
from testcontainers.core.container import DockerContainer
from testcontainers.core.wait_strategies import LogMessageWaitStrategy

from containers.localstack_container import load_localstack_environment
from containers.managed_identity_token_server import (
    ManagedIdentityTokenServer,
)

_IMAGE = "localstack/localstack-azure:latest"
_STARTUP_TIMEOUT_SECONDS = 180.0
_REQUEST_TIMEOUT_SECONDS = 30.0

# The emulator accepts any service principal in its single all-zero tenant
# and subscription. These are placeholders, not secrets.
_TENANT_ID = "00000000-0000-0000-0000-000000000000"
_SUBSCRIPTION_ID = "00000000-0000-0000-0000-000000000000"
_CLIENT_ID = "any-app"
_CLIENT_SECRET = "dummy"
_RESOURCE_GROUP = "envilder-tests"
_LOCATION = "westeurope"
_MANAGEMENT_SCOPE = "https://management.azure.com/.default"

# Variables that would make DefaultAzureCredential pick a credential ahead of
# ManagedIdentityCredential (and possibly reach real Azure). They are cleared
# while the emulator runs and restored on teardown.
_COMPETING_AZURE_ENV_VARS = (
    "AZURE_TENANT_ID",
    "AZURE_CLIENT_ID",
    "AZURE_CLIENT_SECRET",
    "AZURE_CLIENT_CERTIFICATE_PATH",
    "AZURE_USERNAME",
    "AZURE_PASSWORD",
    "AZURE_FEDERATED_TOKEN_FILE",
    "AZURE_AUTHORITY_HOST",
    "AZURE_TOKEN_CREDENTIALS",
)
_MANAGED_IDENTITY_ENV_VARS = ("IDENTITY_ENDPOINT", "IDENTITY_HEADER")


class LocalStackAzureContainer:
    def __init__(self) -> None:
        self._container: DockerContainer | None = None
        self._vault_url: str = ""
        self._credential: ClientSecretCredential | None = None
        self._token_server: ManagedIdentityTokenServer | None = None
        self._previous_env: dict[str, str | None] = {}

    def start(self) -> "LocalStackAzureContainer":
        print("\n[LocalStackAzure] Starting container...")

        environment = load_localstack_environment()
        if not environment.get("LOCALSTACK_AUTH_TOKEN"):
            raise EnvironmentError(
                "LOCALSTACK_AUTH_TOKEN could not be resolved from envilder.json"
            )

        self._previous_env = {
            name: os.environ.get(name)
            for name in (
                *_COMPETING_AZURE_ENV_VARS,
                *_MANAGED_IDENTITY_ENV_VARS,
            )
        }

        try:
            # Vault URIs embed the gateway port, so the host port must match
            # the port the emulator listens on inside the container.
            port = _find_free_port()
            suffix = uuid.uuid4().hex[:8]
            self._container = (
                DockerContainer(_IMAGE)
                .with_name(f"localstack-azure-{suffix}")
                .with_bind_ports(port, port)
                .with_env("GATEWAY_LISTEN", f"0.0.0.0:{port}")
                .with_env(
                    "LOCALSTACK_HOST", f"localhost.localstack.cloud:{port}"
                )
                .waiting_for(
                    LogMessageWaitStrategy(r"Ready\.").with_startup_timeout(
                        _STARTUP_TIMEOUT_SECONDS
                    )
                )
            )
            for key, value in environment.items():
                self._container.with_env(key, value)
            self._container.start()

            authority_host = f"https://azure.localhost.localstack.cloud:{port}"
            self._credential = ClientSecretCredential(
                _TENANT_ID,
                _CLIENT_ID,
                _CLIENT_SECRET,
                authority=authority_host,
                disable_instance_discovery=True,
            )
            self._vault_url = self._create_vault(
                authority_host, f"kv-{suffix}"
            )

            # Lets DefaultAzureCredential (used by the SDK factory) reach the
            # emulator through its ManagedIdentityCredential.
            self._token_server = ManagedIdentityTokenServer(
                self._credential
            ).start()
            for name in _COMPETING_AZURE_ENV_VARS:
                os.environ.pop(name, None)
            os.environ["IDENTITY_ENDPOINT"] = self._token_server.endpoint
            os.environ["IDENTITY_HEADER"] = self._token_server.identity_header
        except Exception:
            self.stop()
            raise

        print(f"[LocalStackAzure] Vault ready at: {self._vault_url}")
        return self

    def stop(self) -> None:
        try:
            if self._token_server:
                self._token_server.stop()
                self._token_server = None
            if self._container:
                print("[LocalStackAzure] Stopping container...")
                self._container.stop()
                self._container = None
        finally:
            if self._credential:
                self._credential.close()
                self._credential = None
            for name, previous in self._previous_env.items():
                if previous is None:
                    os.environ.pop(name, None)
                else:
                    os.environ[name] = previous
            self._previous_env = {}

    @property
    def vault_url(self) -> str:
        return self._vault_url

    def create_secret_client(self) -> SecretClient:
        # Authenticates like production code does, through
        # DefaultAzureCredential and the local managed identity token server.
        # The emulator serves reads without a token, so writes made with this
        # client are what exercise that server.
        if self._token_server is None:
            raise RuntimeError("Container has not been started")
        return SecretClient(
            vault_url=self._vault_url, credential=DefaultAzureCredential()
        )

    def create_provider(self) -> AzureKeyVaultSecretProvider:
        return AzureKeyVaultSecretProvider(self.create_secret_client())

    def _create_vault(self, management_url: str, vault_name: str) -> str:
        assert self._credential is not None
        token = self._credential.get_token(_MANAGEMENT_SCOPE).token
        headers = {"Authorization": f"Bearer {token}"}
        group_url = (
            f"{management_url}/subscriptions/{_SUBSCRIPTION_ID}"
            f"/resourceGroups/{_RESOURCE_GROUP}"
        )

        _arm_put(
            f"{group_url}?api-version=2021-04-01",
            headers,
            {"location": _LOCATION},
        )
        vault = _arm_put(
            f"{group_url}/providers/Microsoft.KeyVault/vaults/{vault_name}"
            "?api-version=2023-07-01",
            headers,
            {
                "location": _LOCATION,
                "properties": {
                    "tenantId": _TENANT_ID,
                    "sku": {"family": "A", "name": "standard"},
                    "accessPolicies": [],
                },
            },
        )

        vault_uri: str = vault["properties"]["vaultUri"]
        return vault_uri.rstrip("/")


def _arm_put(
    url: str, headers: dict[str, str], body: dict[str, Any]
) -> dict[str, Any]:
    response = requests.put(
        url, headers=headers, json=body, timeout=_REQUEST_TIMEOUT_SECONDS
    )
    if not response.ok:
        raise RuntimeError(
            f"ARM request failed ({response.status_code}): {response.text}"
        )
    result: dict[str, Any] = response.json()
    return result


def _find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("", 0))
        port: int = sock.getsockname()[1]
        return port
