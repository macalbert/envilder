from __future__ import annotations

from dataclasses import dataclass, field

from envilder.domain.secret_provider_type import SecretProviderType


@dataclass
class EnvilderOptions:
    """Runtime overrides for map file configuration.

    Values set here take precedence over :class:`MapFileConfig`.

    Attributes:
        provider: Override the secret provider backend.
        vault_url: Override the Azure Key Vault URL.
        profile: Override the AWS named profile.
        allowed_vault_hosts: Extra Azure Key Vault host suffixes to
            trust on top of the public, China, US Government and
            Germany cloud hosts (for example
            ``.localhost.localstack.cloud``).
    """

    provider: SecretProviderType | None = field(default=None)
    vault_url: str | None = field(default=None)
    profile: str | None = field(default=None)
    allowed_vault_hosts: list[str] | None = field(default=None)
