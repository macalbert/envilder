from __future__ import annotations

from dataclasses import dataclass, field

from envilder.domain.secret_provider_type import SecretProviderType


@dataclass
class MapFileConfig:
    """Configuration read from the ``$config`` section of a map file.

    Attributes:
        provider: Secret backend; defaults to AWS when ``None``.
        vault_url: Azure Key Vault URL; required when provider is Azure.
        profile: AWS named profile; uses the default credential chain when ``None``.
    """

    provider: SecretProviderType | None = field(default=None)
    vault_url: str | None = field(default=None)
    profile: str | None = field(default=None)
