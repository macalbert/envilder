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
    """

    provider: SecretProviderType | None = field(default=None)
    vault_url: str | None = field(default=None)
    profile: str | None = field(default=None)
