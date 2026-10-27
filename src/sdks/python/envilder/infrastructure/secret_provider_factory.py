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
from envilder.infrastructure.azure.azure_vault_url_validator import (
    DEFAULT_VAULT_HOSTS,
    is_allowed_vault_host,
    validate_azure_vault_url,
)


class _SecretProviderFactory:
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
                return _create_azure_provider(
                    vault_url, opts.allowed_vault_hosts or []
                )
            case SecretProviderType.AWS | None:
                return _create_aws_provider(profile)


def _create_azure_provider(
    vault_url: str | None,
    extra_vault_hosts: list[str],
) -> AzureKeyVaultSecretProvider:
    if not vault_url or not vault_url.strip():
        raise ValueError(
            "Vault URL must be provided for Azure Key Vault provider."
        )

    allowed_hosts = [*DEFAULT_VAULT_HOSTS, *extra_vault_hosts]
    hostname = validate_azure_vault_url(vault_url, allowed_hosts)
    # Key Vault's challenge carries the public cloud resource, which never
    # matches a custom host, so verification only stays on for the defaults.
    verify_challenge_resource = is_allowed_vault_host(
        hostname, DEFAULT_VAULT_HOSTS
    )

    credential = DefaultAzureCredential()
    secret_client = SecretClient(
        vault_url=vault_url,
        credential=credential,
        verify_challenge_resource=verify_challenge_resource,
    )
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
        raise ValueError(
            f"Failed to create AWS session with profile '{profile}': {e}"
        ) from e
