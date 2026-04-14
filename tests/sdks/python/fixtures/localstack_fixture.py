from __future__ import annotations

from pathlib import Path

import boto3
import pytest
from envilder.application.envilder_client import EnvilderClient
from envilder.application.map_file_parser import MapFileParser
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)
from envilder.infrastructure.secret_provider_factory import (
    SecretProviderFactory,
)
from testcontainers.localstack import LocalStackContainer

_SECRETS_MAP = Path(__file__).resolve().parent.parent / "secrets-map.json"


def _load_environment() -> dict[str, str]:
    json_content = _SECRETS_MAP.read_text(encoding="utf-8")
    parser = MapFileParser()
    map_file = parser.parse(json_content)
    client = _resolve_client(map_file.config)
    return client.resolve_secrets(map_file)


def _resolve_client(config: MapFileConfig) -> EnvilderClient:
    try:
        provider = SecretProviderFactory.create(config)
        return EnvilderClient(provider)
    except (ValueError, Exception):
        fallback = MapFileConfig(provider=SecretProviderType.AWS)
        return EnvilderClient(SecretProviderFactory.create(fallback))


@pytest.fixture(scope="session")
def localstack_container():
    environment = _load_environment()
    if not environment.get("LOCALSTACK_AUTH_TOKEN"):
        raise EnvironmentError(
            "LOCALSTACK_AUTH_TOKEN could not be resolved from secrets-map.json"
        )
    container = LocalStackContainer("localstack/localstack:stable")
    for key, value in environment.items():
        container.with_env(key, value)
    with container:
        yield container


@pytest.fixture(scope="session")
def ssm_client(localstack_container):
    return boto3.client(
        "ssm",
        endpoint_url=localstack_container.get_url(),
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test",
    )


@pytest.fixture(scope="session")
def aws_provider(ssm_client):
    return AwsSsmSecretProvider(ssm_client)
