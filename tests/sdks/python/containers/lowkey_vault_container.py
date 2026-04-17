from __future__ import annotations

import os
import time

import requests
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)
from testcontainers.core.container import DockerContainer

_IMAGE = "nagyesta/lowkey-vault:7.1.61"
_HTTPS_PORT = 8443
_HTTP_PORT = 8080


class LowkeyVaultContainer:
    def __init__(self) -> None:
        self._container: DockerContainer | None = None
        self._vault_url: str = ""
        self._token_url: str = ""
        self._prev_identity_endpoint: str | None = None
        self._prev_identity_header: str | None = None

    def start(self) -> "LowkeyVaultContainer":
        print("\n[LowkeyVault] Starting container...")

        try:
            self._container = (
                DockerContainer(_IMAGE)
                .with_exposed_ports(_HTTPS_PORT, _HTTP_PORT)
                .with_env(
                    "LOWKEY_ARGS",
                    "--server.port=8443" " --LOWKEY_VAULT_RELAXED_PORTS=true",
                )
            )
            self._container.start()

            host = self._container.get_container_host_ip()
            https_port = self._container.get_exposed_port(_HTTPS_PORT)
            http_port = self._container.get_exposed_port(_HTTP_PORT)

            self._vault_url = f"https://{host}:{https_port}"
            self._token_url = (
                f"http://{host}:{http_port}" "/metadata/identity/oauth2/token"
            )

            self._wait_until_ready()

            self._prev_identity_endpoint = os.environ.get("IDENTITY_ENDPOINT")
            self._prev_identity_header = os.environ.get("IDENTITY_HEADER")
            os.environ["IDENTITY_ENDPOINT"] = self._token_url
            os.environ["IDENTITY_HEADER"] = "dummy"
        except Exception:
            self.stop()
            raise

        print(f"[LowkeyVault] Ready at: {self._vault_url}")
        return self

    def stop(self) -> None:
        try:
            if self._container:
                print("[LowkeyVault] Stopping container...")
                self._container.stop()
                self._container = None
        finally:
            if self._prev_identity_endpoint is None:
                os.environ.pop("IDENTITY_ENDPOINT", None)
            else:
                os.environ["IDENTITY_ENDPOINT"] = self._prev_identity_endpoint

            if self._prev_identity_header is None:
                os.environ.pop("IDENTITY_HEADER", None)
            else:
                os.environ["IDENTITY_HEADER"] = self._prev_identity_header

    @property
    def vault_url(self) -> str:
        return self._vault_url

    def create_secret_client(self) -> SecretClient:
        return SecretClient(
            vault_url=self._vault_url,
            credential=DefaultAzureCredential(),
            connection_verify=False,  # test-only: Lowkey uses self-signed TLS
            verify_challenge_resource=False,
            api_version="7.6",  # pin to version supported by Lowkey Vault
        )

    def create_provider(self) -> AzureKeyVaultSecretProvider:
        return AzureKeyVaultSecretProvider(self.create_secret_client())

    def _wait_until_ready(
        self,
        max_retries: int = 30,
        delay: float = 1.0,
    ) -> None:
        url = f"{self._vault_url}/ping"
        for attempt in range(max_retries):
            try:
                response = requests.get(
                    url,
                    timeout=2,
                    verify=False,  # test-only: self-signed TLS
                )
                if response.status_code == 200:
                    return
            except requests.RequestException as e:
                if attempt == max_retries - 1:
                    raise TimeoutError(
                        "LowkeyVault did not become ready"
                        f" after {max_retries} attempts"
                    ) from e

            if attempt < max_retries - 1:
                time.sleep(delay)

        raise TimeoutError(
            "LowkeyVault did not become ready" f" after {max_retries} attempts"
        )
