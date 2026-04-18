from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path
from typing import Generator

import pytest
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)
from mypy_boto3_ssm import SSMClient

from containers.localstack_container import LocalStackContainer

_ENV_KEYS = [
    "AWS_ENDPOINT_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_DEFAULT_REGION",
]

_PROFILE_ENV_KEYS = [
    "AWS_CONFIG_FILE",
    "AWS_SHARED_CREDENTIALS_FILE",
    "AWS_ENDPOINT_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_DEFAULT_REGION",
    "AWS_REGION",
    "AWS_PROFILE",
]


def _restore_env(originals: dict[str, str | None]) -> None:
    for key, value in originals.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value


@pytest.fixture(scope="session")
def localstack_container() -> Generator[LocalStackContainer, None, None]:
    container = LocalStackContainer().start()
    yield container
    container.stop()


@pytest.fixture(scope="session")
def ssm_client(localstack_container: LocalStackContainer) -> SSMClient:
    return localstack_container.get_ssm_client()


@pytest.fixture(scope="session")
def aws_provider(
    localstack_container: LocalStackContainer,
) -> AwsSsmSecretProvider:
    return localstack_container.create_provider()


@pytest.fixture
def aws_env_for_factory(
    localstack_container: LocalStackContainer,
) -> Generator[None, None, None]:
    originals = {k: os.environ.get(k) for k in _ENV_KEYS}
    os.environ["AWS_ENDPOINT_URL"] = localstack_container.get_endpoint_url()
    os.environ["AWS_ACCESS_KEY_ID"] = "test"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "test"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    yield
    _restore_env(originals)


@pytest.fixture
def aws_env_with_profile_for_factory(
    localstack_container: LocalStackContainer,
) -> Generator[None, None, None]:
    originals = {k: os.environ.get(k) for k in _PROFILE_ENV_KEYS}
    tmp_dir = tempfile.mkdtemp()
    config_path = Path(tmp_dir) / "config"
    credentials_path = Path(tmp_dir) / "credentials"

    endpoint = localstack_container.get_endpoint_url()
    config_path.write_text(
        f"[profile localstack-test]\n"
        f"region = us-east-1\n"
        f"endpoint_url = {endpoint}\n"
    )
    credentials_path.write_text(
        "[localstack-test]\n"
        "aws_access_key_id = test\n"
        "aws_secret_access_key = test\n"
    )

    os.environ["AWS_CONFIG_FILE"] = str(config_path)
    os.environ["AWS_SHARED_CREDENTIALS_FILE"] = str(credentials_path)
    os.environ["AWS_ENDPOINT_URL"] = endpoint
    for key in (
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_DEFAULT_REGION",
        "AWS_REGION",
        "AWS_PROFILE",
    ):
        os.environ.pop(key, None)

    yield

    _restore_env(originals)
    shutil.rmtree(tmp_dir, ignore_errors=True)
