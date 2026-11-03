from __future__ import annotations

import boto3
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

from envilder.domain.envilder_options import EnvilderOptions
from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.ports.secret_existence_checker import (
    _CheckableSecretProvider,
)
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.aws.aws_ssm_secret_provider import (
    AwsSsmSecretProvider,
)
from envilder.infrastructure.azure.azure_key_vault_secret_provider import (
    AzureKeyVaultSecretProvider,
)


class _AwsProfileError(ValueError):
    """The AWS session cannot be created with the named profile.

    Still a ``ValueError`` for callers of a load; contract validation reports
    it as an authentication failure instead.
    """


class _SecretProviderFactory:
    @staticmethod
    def create(
        config: MapFileConfig,
        options: EnvilderOptions | None = None,
    ) -> _CheckableSecretProvider:
        if config is None:
            raise ValueError("config cannot be None")

        opts = options or EnvilderOptions()
        provider = opts.provider or config.provider
        profile = opts.profile or config.profile
        vault_url = opts.vault_url or config.vault_url

        if provider is not None and provider not in (
            SecretProviderType.AWS,
            SecretProviderType.AZURE,
        ):
            raise ValueError(f"Unsupported secret provider: {provider!r}")

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
    session = _create_aws_session(profile)
    return AwsSsmSecretProvider(session.client("ssm"), profile)


def _create_aws_session(profile: str | None) -> boto3.Session:
    if not profile:
        return boto3.Session()

    try:
        return boto3.Session(profile_name=profile)
    except Exception as e:
        raise _AwsProfileError(
            f"Failed to create AWS session with profile '{profile}': {e}"
        ) from e
