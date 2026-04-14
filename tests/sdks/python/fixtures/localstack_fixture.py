from __future__ import annotations

from typing import Generator

import pytest
from containers.localstack_container import LocalStackContainer

from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)


@pytest.fixture(scope="session")
def localstack_container() -> Generator[LocalStackContainer, None, None]:
    container = LocalStackContainer().start()
    yield container
    container.stop()


@pytest.fixture(scope="session")
def ssm_client(localstack_container: LocalStackContainer):  # type: ignore[type-arg]
    return localstack_container.get_ssm_client()


@pytest.fixture(scope="session")
def aws_provider(
    localstack_container: LocalStackContainer,
) -> AwsSsmSecretProvider:
    return localstack_container.create_provider()
