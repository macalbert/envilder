from __future__ import annotations

import json

from envilder.domain.map_file_config import MapFileConfig
from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.secret_provider_type import SecretProviderType

_CONFIG_KEY = "$config"

_PROVIDER_MAP = {
    "aws": SecretProviderType.AWS,
    "azure": SecretProviderType.AZURE,
}


class MapFileParser:
    def parse(self, json_content: str) -> ParsedMapFile:
        document = json.loads(json_content)

        if not isinstance(document, dict):
            raise ValueError("Map file must be a JSON object.")

        mappings: dict[str, str] = {}
        config = MapFileConfig()

        for key, value in document.items():
            if key == _CONFIG_KEY:
                if isinstance(value, dict):
                    config = _deserialize_config(value)
                continue

            if isinstance(value, str):
                mappings[key] = value

        return ParsedMapFile(config=config, mappings=mappings)


def _deserialize_config(raw: dict[str, object]) -> MapFileConfig:
    provider_raw = raw.get("provider")
    provider = (
        _PROVIDER_MAP.get(provider_raw.lower())
        if isinstance(provider_raw, str)
        else None
    )

    vault_url = raw.get("vaultUrl")
    profile = raw.get("profile")

    return MapFileConfig(
        provider=provider,
        vault_url=vault_url if isinstance(vault_url, str) else None,
        profile=profile if isinstance(profile, str) else None,
    )
