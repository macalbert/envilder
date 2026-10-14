from __future__ import annotations

from pathlib import Path

import boto3
from envilder.application.envilder_client import EnvilderClient
from envilder.application.map_file_parser import MapFileParser
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)
from envilder.infrastructure.secret_provider_factory import (
    _SecretProviderFactory,
)
from mypy_boto3_ssm import SSMClient
from testcontainers.localstack import (
    LocalStackContainer as BaseLocalStackContainer,
)

_SECRETS_MAP = Path(__file__).resolve().parents[4] / "envilder.json"


# Resolves the LocalStack container environment (auth token included) from
# the repository's envilder.json, falling back to AWS when the map file's
# provider cannot be built.
def load_localstack_environment() -> dict[str, str]:
    json_content = _SECRETS_MAP.read_text(encoding="utf-8")
    map_file = MapFileParser().parse(json_content)
    client = _resolve_client(map_file.config)
    return client.resolve_secrets(map_file)


def _resolve_client(config: MapFileConfig) -> EnvilderClient:
    try:
        provider = _SecretProviderFactory.create(config)
        return EnvilderClient(provider)
    except ValueError:
        fallback = MapFileConfig(provider=SecretProviderType.AWS)
        return EnvilderClient(_SecretProviderFactory.create(fallback))


class LocalStackContainer:
    def __init__(self) -> None:
        self._container: BaseLocalStackContainer | None = None
        self._endpoint_url: str = ""

    def start(self) -> "LocalStackContainer":
        print("\n[LocalStack] Starting container...")

        environment = load_localstack_environment()
        if not environment.get("LOCALSTACK_AUTH_TOKEN"):
            raise EnvironmentError(
                "LOCALSTACK_AUTH_TOKEN could not be resolved from envilder.json"
            )

        self._container = BaseLocalStackContainer(
            "localstack/localstack:stable"
        )
        for key, value in environment.items():
            self._container.with_env(key, value)

        self._container.start()
        self._endpoint_url = self._container.get_url()

        print(f"[LocalStack] Ready at: {self._endpoint_url}")
        return self

    def stop(self) -> None:
        if self._container:
            print("[LocalStack] Stopping container...")
            self._container.stop()
            self._container = None

    def get_endpoint_url(self) -> str:
        return self._endpoint_url

    def get_ssm_client(self) -> SSMClient:
        return boto3.client(
            "ssm",
            endpoint_url=self._endpoint_url,
            region_name="us-east-1",
            aws_access_key_id="test",
            aws_secret_access_key="test",
        )

    def create_provider(self) -> AwsSsmSecretProvider:
        return AwsSsmSecretProvider(self.get_ssm_client())
