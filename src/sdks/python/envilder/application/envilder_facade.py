from __future__ import annotations

from envilder.application.envilder_client import EnvilderClient
from envilder.application.map_file_parser import MapFileParser
from envilder.domain.envilder_options import EnvilderOptions
from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.secret_provider_factory import (
    SecretProviderFactory,
)


class Envilder:
    def __init__(self, file_path: str) -> None:
        if not file_path:
            raise ValueError("file_path cannot be empty.")
        self._file_path = file_path
        self._options = EnvilderOptions()

    @staticmethod
    def from_file(file_path: str) -> Envilder:
        return Envilder(file_path)

    @staticmethod
    def load(file_path: str) -> dict[str, str]:
        return Envilder(file_path).inject()

    @staticmethod
    def resolve_file(file_path: str) -> dict[str, str]:
        return Envilder(file_path).resolve()

    def with_provider(self, provider: SecretProviderType) -> Envilder:
        self._options.provider = provider
        return self

    def with_vault_url(self, vault_url: str) -> Envilder:
        self._options.vault_url = vault_url
        return self

    def with_profile(self, profile: str) -> Envilder:
        self._options.profile = profile
        return self

    def resolve(self) -> dict[str, str]:
        map_file = self._parse_file()
        options = self._build_options()
        provider = SecretProviderFactory.create(
            map_file.config, options=options
        )
        client = EnvilderClient(provider)
        return client.resolve_secrets(map_file)

    def inject(self) -> dict[str, str]:
        secrets = self.resolve()
        EnvilderClient.inject_into_environment(secrets)
        return secrets

    def _parse_file(self) -> ParsedMapFile:
        with open(self._file_path) as f:
            json_content = f.read()
        return MapFileParser().parse(json_content)

    def _build_options(self) -> EnvilderOptions | None:
        has_overrides = (
            self._options.provider is not None
            or self._options.vault_url is not None
            or self._options.profile is not None
        )
        return self._options if has_overrides else None
