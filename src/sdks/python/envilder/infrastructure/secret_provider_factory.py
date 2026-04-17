from __future__ import annotations

import os

import boto3
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

from envilder.domain.envilder_options import EnvilderOptions
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.ports.secret_provider import ISecretProvider
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)


class SecretProviderFactory:
    @staticmethod
    def create(
        config: MapFileConfig,
        options: EnvilderOptions | None = None,
    ) -> ISecretProvider:
        if config is None:
            raise ValueError("config cannot be None")

        provider = (
            options.provider
            if options and options.provider
            else config.provider
        )

        match provider:
            case SecretProviderType.AZURE:
                return _create_azure_provider(config, options)
            case SecretProviderType.AWS | None:
                return _create_aws_provider(config, options)
            case _:
                raise ValueError(f"Unsupported secret provider: {provider!r}")


def _create_azure_provider(
    config: MapFileConfig, options: EnvilderOptions | None
) -> AzureKeyVaultSecretProvider:
    vault_url = (
        options.vault_url
        if options and options.vault_url
        else config.vault_url
    )

    if not vault_url or not vault_url.strip():
        raise ValueError(
            "Vault URL must be provided for Azure Key Vault provider."
        )

    credential = DefaultAzureCredential()
    secret_client = SecretClient(vault_url=vault_url, credential=credential)
    return AzureKeyVaultSecretProvider(secret_client)


def _create_aws_provider(
    config: MapFileConfig, options: EnvilderOptions | None
) -> AwsSsmSecretProvider:
    profile = (
        options.profile if options and options.profile else config.profile
    )

    if not profile:
        session = boto3.Session()
        return AwsSsmSecretProvider(session.client("ssm"))

    try:
        region = _resolve_region_from_env()
        session = boto3.Session(
            profile_name=profile,
            region_name=region,
        )
        return AwsSsmSecretProvider(session.client("ssm"))
    except Exception as e:
        raise ValueError(
            f"Failed to create AWS session with profile '{profile}': {e}"
        ) from e


def _resolve_region_from_env() -> str | None:
    return os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION")
