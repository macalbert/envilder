from __future__ import annotations

from typing import overload

from envilder.application.envilder_client import EnvilderClient
from envilder.application.map_file_parser import MapFileParser
from envilder.domain.envilder_options import EnvilderOptions
from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.secret_provider_type import SecretProviderType
from envilder.infrastructure.secret_provider_factory import (
    _SecretProviderFactory,
)


class Envilder:
    """Facade for loading secrets from cloud providers.

    Supports loading from a single map file or from an
    environment-based mapping that routes each environment
    name to its own map file (or ``None`` to skip).

    Examples::

        # Single file — resolve + inject into os.environ:
        Envilder.load("secrets-map.json")

        # Single file — resolve only (no injection):
        Envilder.resolve_file("secrets-map.json")

        # Environment-based — load the right file per env:
        Envilder.load("production", {
            "production": "prod-secrets.json",
            "development": "dev-secrets.json",
            "test": None,
        })

        # Fluent builder with provider override:
        secrets = (
            Envilder.from_map_file("secrets-map.json")
            .with_provider(SecretProviderType.AZURE)
            .with_vault_url("https://my-vault.vault.azure.net")
            .inject()
        )
    """

    def __init__(self, file_path: str) -> None:
        if not file_path:
            raise ValueError("file_path cannot be empty.")
        self._file_path = file_path
        self._options = EnvilderOptions()

    @staticmethod
    def from_map_file(file_path: str) -> Envilder:
        """Return a fluent builder bound to *file_path*.

        Chain ``.with_provider()``, ``.with_vault_url()``,
        or ``.with_profile()`` before calling ``.resolve()``
        or ``.inject()``.
        """
        return Envilder(file_path)

    @overload
    @staticmethod
    def load(
        file_path_or_env: str,
    ) -> dict[str, str]: ...

    @overload
    @staticmethod
    def load(
        file_path_or_env: str,
        env_mapping: dict[str, str | None],
    ) -> dict[str, str]: ...

    @staticmethod
    def load(
        file_path_or_env: str,
        env_mapping: dict[str, str | None] | None = None,
    ) -> dict[str, str]:
        """Resolve secrets and inject them into ``os.environ``.

        Can be called in two ways:

        ``load(file_path)``
            Load secrets from a single map file.

        ``load(env, env_mapping)``
            Look up *env* in *env_mapping*. If the value is a
            file path, load secrets from that file. If the value
            is ``None`` or *env* is not in the mapping, return
            an empty dict without loading anything.

        Args:
            file_path_or_env: A map-file path (single-arg form)
                or an environment name (two-arg form).
            env_mapping: A dict mapping environment names to
                map-file paths or ``None``.

        Returns:
            A dict of resolved secrets (``{VAR_NAME: value}``).

        Raises:
            ValueError: If the first argument is empty, or if
                ``env_mapping`` contains an empty or
                whitespace-only file path for the matched
                environment.

        Examples::

            Envilder.load("secrets-map.json")

            Envilder.load("production", {
                "production": "prod-secrets.json",
                "test": None,
            })
        """
        if env_mapping is not None:
            source = Envilder._resolve_env_source(
                file_path_or_env, env_mapping
            )
            if source is not None:
                return Envilder(source).inject()
            return {}
        file_path = file_path_or_env.strip()
        if not file_path:
            raise ValueError(
                "file_path_or_env must not be empty" " or whitespace only."
            )
        return Envilder(file_path).inject()

    @overload
    @staticmethod
    def resolve_file(
        file_path_or_env: str,
    ) -> dict[str, str]: ...

    @overload
    @staticmethod
    def resolve_file(
        file_path_or_env: str,
        env_mapping: dict[str, str | None],
    ) -> dict[str, str]: ...

    @staticmethod
    def resolve_file(
        file_path_or_env: str,
        env_mapping: dict[str, str | None] | None = None,
    ) -> dict[str, str]:
        """Resolve secrets without injecting into ``os.environ``.

        Can be called in two ways:

        ``resolve_file(file_path)``
            Resolve secrets from a single map file.

        ``resolve_file(env, env_mapping)``
            Look up *env* in *env_mapping*. If the value is a
            file path, resolve secrets from that file. If the
            value is ``None`` or *env* is not in the mapping,
            return an empty dict.

        Args:
            file_path_or_env: A map-file path (single-arg form)
                or an environment name (two-arg form).
            env_mapping: A dict mapping environment names to
                map-file paths or ``None``.

        Returns:
            A dict of resolved secrets (``{VAR_NAME: value}``).

        Raises:
            ValueError: If the first argument is empty, or if
                ``env_mapping`` contains an empty or
                whitespace-only file path for the matched
                environment.

        Examples::

            Envilder.resolve_file("secrets-map.json")

            Envilder.resolve_file("production", {
                "production": "prod-secrets.json",
                "test": None,
            })
        """
        if env_mapping is not None:
            source = Envilder._resolve_env_source(
                file_path_or_env, env_mapping
            )
            if source is not None:
                return Envilder(source).resolve()
            return {}
        file_path = file_path_or_env.strip()
        if not file_path:
            raise ValueError(
                "file_path_or_env must not be empty" " or whitespace only."
            )
        return Envilder(file_path).resolve()

    def with_provider(self, provider: SecretProviderType) -> Envilder:
        """Override the secret provider (AWS or Azure)."""
        self._options.provider = provider
        return self

    def with_vault_url(self, vault_url: str) -> Envilder:
        """Override the Azure Key Vault URL."""
        self._options.vault_url = vault_url
        return self

    def with_profile(self, profile: str) -> Envilder:
        """Override the AWS named profile."""
        self._options.profile = profile
        return self

    def resolve(self) -> dict[str, str]:
        """Resolve secrets and return them as a dict."""
        map_file = self._parse_file()
        options = self._build_options()
        provider = _SecretProviderFactory.create(
            map_file.config, options=options
        )
        client = EnvilderClient(provider)
        return client.resolve_secrets(map_file)

    def inject(self) -> dict[str, str]:
        """Resolve secrets, inject into ``os.environ``, and return them."""
        secrets = self.resolve()
        EnvilderClient.inject_into_environment(secrets)
        return secrets

    def _parse_file(self) -> ParsedMapFile:
        with open(self._file_path, encoding="utf-8") as f:
            json_content = f.read()
        return MapFileParser().parse(json_content)

    def _build_options(self) -> EnvilderOptions | None:
        has_overrides = (
            self._options.provider is not None
            or self._options.vault_url is not None
            or self._options.profile is not None
        )
        return self._options if has_overrides else None

    @staticmethod
    def _resolve_env_source(
        env: str,
        env_mapping: dict[str, str | None],
    ) -> str | None:
        if not env or not env.strip():
            raise ValueError("env cannot be empty.")
        normalized = env.strip()
        source = env_mapping.get(normalized)
        if source is not None:
            stripped = source.strip()
            if not stripped:
                raise ValueError(
                    "env_mapping contains an empty file path"
                    f" for environment '{normalized}'."
                )
            return stripped
        return None
