from __future__ import annotations

import os

from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.ports.secret_provider import ISecretProvider


class EnvilderClient:
    """Core client that resolves secrets from a configured provider.

    For most use cases prefer the :class:`~envilder.Envilder` facade.
    Use this class directly when you need a custom
    :class:`~envilder.ISecretProvider` implementation.

    Example::

        from envilder import EnvilderClient, MapFileParser

        provider = MyCustomProvider()
        with open("secrets-map.json") as f:
            map_file = MapFileParser().parse(f.read())
        secrets = EnvilderClient(provider).resolve_secrets(map_file)
    """

    def __init__(self, secret_provider: ISecretProvider) -> None:
        if secret_provider is None:
            raise ValueError("secret_provider cannot be None")
        self._secret_provider = secret_provider

    def resolve_secrets(self, map_file: ParsedMapFile) -> dict[str, str]:
        """Resolve all mappings against the configured secret provider.

        Entries whose secret does not exist are silently omitted.

        Args:
            map_file: Parsed map file with config and variable mappings.

        Returns:
            A dict of resolved ``{VAR_NAME: value}`` pairs.
        """
        result: dict[str, str] = {}

        for env_var_name, secret_path in map_file.mappings.items():
            secret_value = self._secret_provider.get_secret(secret_path)
            if secret_value is not None:
                result[env_var_name] = secret_value

        return result

    @staticmethod
    def inject_into_environment(secrets: dict[str, str]) -> None:
        """Set every key/value pair as a process-level environment variable."""
        for key, value in secrets.items():
            os.environ[key] = value
