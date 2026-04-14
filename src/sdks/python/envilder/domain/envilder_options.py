from __future__ import annotations

from dataclasses import dataclass, field

from envilder.domain.secret_provider_type import SecretProviderType


@dataclass
class EnvilderOptions:
    provider: SecretProviderType | None = field(default=None)
    vault_url: str | None = field(default=None)
    profile: str | None = field(default=None)
