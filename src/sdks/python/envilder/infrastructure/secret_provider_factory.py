from __future__ import annotations

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

        opts = options or EnvilderOptions()
        provider = opts.provider or config.provider
        profile = opts.profile or config.profile
        vault_url = opts.vault_url or config.vault_url

        if provider == SecretProviderType.AZURE and profile:
            raise ValueError(
                "AWS profile cannot be used with Azure Key Vault provider."
            )

        if provider != SecretProviderType.AZURE and vault_url:
            raise ValueError("Vault URL cannot be used with AWS SSM provider.")

        match provider:
            case SecretProviderType.AZURE:
                return _create_azure_provider(vault_url)
            case SecretProviderType.AWS | None:
                return _create_aws_provider(profile)
            case _:
                raise ValueError(f"Unsupported secret provider: {provider!r}")


def _create_azure_provider(
    vault_url: str | None,
) -> AzureKeyVaultSecretProvider:
    if not vault_url or not vault_url.strip():
        raise ValueError(
            "Vault URL must be provided for Azure Key Vault provider."
        )

    credential = DefaultAzureCredential()
    secret_client = SecretClient(vault_url=vault_url, credential=credential)
    return AzureKeyVaultSecretProvider(secret_client)


def _create_aws_provider(
    profile: str | None,
) -> AwsSsmSecretProvider:
    if not profile:
        session = boto3.Session()
        return AwsSsmSecretProvider(session.client("ssm"))

    try:
        session = boto3.Session(profile_name=profile)
        return AwsSsmSecretProvider(session.client("ssm"))
    except Exception as e:
        raise ValueError(
            f"Failed to create AWS session with profile '{profile}': {e}"
        ) from e
