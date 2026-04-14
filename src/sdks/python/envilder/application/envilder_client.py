from __future__ import annotations

import os

from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.ports.secret_provider import ISecretProvider


class EnvilderClient:
    def __init__(self, secret_provider: ISecretProvider) -> None:
        if secret_provider is None:
            raise ValueError("secret_provider cannot be None")
        self._secret_provider = secret_provider

    def resolve_secrets(self, map_file: ParsedMapFile) -> dict[str, str]:
        result: dict[str, str] = {}

        for env_var_name, secret_path in map_file.mappings.items():
            secret_value = self._secret_provider.get_secret(secret_path)
            if secret_value is not None:
                result[env_var_name] = secret_value

        return result

    @staticmethod
    def inject_into_environment(secrets: dict[str, str]) -> None:
        for key, value in secrets.items():
            os.environ[key] = value
