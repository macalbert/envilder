import os

import boto3
import pytest
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)
from testcontainers.localstack import LocalStackContainer


@pytest.fixture(scope="session")
def localstack_container():
    auth_token = os.environ.get("LOCALSTACK_AUTH_TOKEN", "")
    container = LocalStackContainer("localstack/localstack:stable")
    if auth_token:
        container.with_env("LOCALSTACK_AUTH_TOKEN", auth_token)
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
