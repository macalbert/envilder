"""Validation of a map file against the contract the CLI enforces.

Checks a map file against ``spec/map-file.v1.json`` and the provider
configuration it resolves to, with the same rules and wording as
``envilder validate --offline``. The SDK supports fewer providers than the
schema declares, so ``gcp``, ``hashicorp`` and ``file`` are reported as
unsupported. Builder overrides take precedence over ``$config``, as they do on
a load. No mapped value ever reaches an error.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlsplit

from envilder.domain.contract_validation_result import MapFileError
from envilder.domain.envilder_options import EnvilderOptions
from envilder.domain.environment_variable_name import (
    invalid_environment_variable_name_message,
    is_valid_environment_variable_name,
    quote_name,
)

_SUPPORTED_PROVIDERS = ("aws", "azure")

_DEFAULT_PROVIDER = "aws"

_CONFIG_FIELDS = (
    "provider",
    "profile",
    "vaultUrl",
    "projectId",
    "namespace",
    "path",
    "name",
    "description",
    "owner",
    "environment",
)

_URI_FIELDS = frozenset({"vaultUrl"})

# Provider-specific ``$config`` fields and the providers that accept each.
_PROVIDER_SPECIFIC_FIELDS: dict[str, tuple[str, ...]] = {
    "profile": ("aws",),
    "vaultUrl": ("azure", "hashicorp"),
    "projectId": ("gcp",),
    "namespace": ("hashicorp",),
    "path": ("file",),
}

# The ``$config`` field each supported provider cannot work without.
_REQUIRED_PROVIDER_FIELDS = {"azure": "vaultUrl"}

_PROVIDER_LABELS = {"aws": "AWS", "azure": "Azure"}

# The builder method that overrides each field, named in errors.
_OVERRIDE_METHODS = {
    "provider": "with_provider()",
    "profile": "with_profile()",
    "vaultUrl": "with_vault_url()",
}

_SAFE_KEY = re.compile(r"[A-Za-z0-9_$./-]+")
_URI_SHAPE = re.compile(r"[A-Za-z][A-Za-z0-9+.-]*:\S*")


@dataclass(frozen=True)
class _SourcedValue:
    """A configuration field with the key that named it, for the report."""

    value: str
    source: str


def validate_map_file_content(
    json_content: str, overrides: EnvilderOptions
) -> list[MapFileError]:
    """Parse and validate the raw content of a map file."""
    try:
        document = json.loads(json_content)
    except ValueError:
        # The parser's message quotes the surrounding text, which can be a
        # secret pasted into the file, so it is not repeated.
        return [MapFileError("(root)", "The map file is not valid JSON.")]
    return validate_map_file(document, overrides)


def validate_map_file(
    document: Any, overrides: EnvilderOptions
) -> list[MapFileError]:
    """Validate a parsed map file and return every error found."""
    if not isinstance(document, dict):
        return [MapFileError("(root)", "The map file must be a JSON object.")]

    errors: list[MapFileError] = []
    file_config: dict[str, Any] = {}
    for key, value in document.items():
        if key == "$schema":
            errors.extend(_validate_uri("$schema", value))
        elif key == "$config":
            if isinstance(value, dict):
                file_config = value
                errors.extend(_validate_config_fields(value))
            else:
                errors.append(
                    MapFileError("$config", "$config must be an object.")
                )
        elif key.startswith("$"):
            errors.append(
                MapFileError(
                    key,
                    f"{_format_key(key)} is reserved: only $schema and"
                    ' $config may start with "$".',
                )
            )
        else:
            errors.extend(_validate_mapping(key, value))

    errors.extend(_validate_provider_configuration(file_config, overrides))
    return errors


def _validate_mapping(key: str, value: Any) -> list[MapFileError]:
    errors: list[MapFileError] = []
    if not is_valid_environment_variable_name(key):
        errors.append(
            MapFileError(
                key, f"{invalid_environment_variable_name_message(key)}."
            )
        )
    if not isinstance(value, str):
        # The type only: the value itself may be a secret pasted by mistake.
        errors.append(
            MapFileError(
                key,
                f"{_format_key(key)} must map to a string secret path,"
                f" not {_describe_type(value)}.",
            )
        )
    return errors


def _validate_config_fields(config: dict[str, Any]) -> list[MapFileError]:
    errors: list[MapFileError] = []
    for field, value in config.items():
        key = f"$config.{field}"
        if field not in _CONFIG_FIELDS:
            errors.append(
                MapFileError(
                    key,
                    f"{_format_key(key)} is not a known field."
                    f" Allowed fields: {', '.join(_CONFIG_FIELDS)}.",
                )
            )
        elif not isinstance(value, str):
            errors.append(
                MapFileError(
                    key,
                    f"{key} must be a string, not {_describe_type(value)}.",
                )
            )
        elif field in _URI_FIELDS:
            errors.extend(_validate_uri(key, value))
    return errors


def _validate_uri(key: str, value: Any) -> list[MapFileError]:
    if not isinstance(value, str):
        return [
            MapFileError(
                key, f"{key} must be a string, not {_describe_type(value)}."
            )
        ]
    if not _is_uri(value):
        return [MapFileError(key, f"{key} must be an absolute URI.")]
    return []


def _validate_provider_configuration(
    file_config: dict[str, Any], overrides: EnvilderOptions
) -> list[MapFileError]:
    effective = _resolve_effective_config(file_config, overrides)
    provider = effective.get("provider") or _SourcedValue(
        _DEFAULT_PROVIDER, "$config.provider"
    )

    if provider.value not in _SUPPORTED_PROVIDERS:
        return [
            MapFileError(
                provider.source,
                f"Unsupported provider: {_format_key(provider.value)}."
                f" Supported providers: {', '.join(_SUPPORTED_PROVIDERS)}.",
            )
        ]

    errors: list[MapFileError] = []
    for field, valid_providers in _PROVIDER_SPECIFIC_FIELDS.items():
        setting = effective.get(field)
        if setting is None or provider.value in valid_providers:
            continue
        usable = [p for p in valid_providers if p in _SUPPORTED_PROVIDERS]
        errors.append(
            MapFileError(
                setting.source,
                f"{setting.source} is only supported with the"
                f" {' or '.join(usable or valid_providers)} provider"
                f" (current provider: {provider.value}).",
            )
        )

    required = _REQUIRED_PROVIDER_FIELDS.get(provider.value)
    if required is not None and required not in effective:
        errors.append(
            MapFileError(
                f"$config.{required}",
                f"{required} is required when using"
                f" {_PROVIDER_LABELS[provider.value]} provider."
                f" Set it in $config.{required} in your map file"
                f" or via {_OVERRIDE_METHODS[required]}.",
            )
        )
    return errors


def _resolve_effective_config(
    file_config: dict[str, Any], overrides: EnvilderOptions
) -> dict[str, _SourcedValue]:
    effective: dict[str, _SourcedValue] = {}
    for field in _CONFIG_FIELDS:
        value = file_config.get(field)
        if isinstance(value, str):
            effective[field] = _SourcedValue(value, f"$config.{field}")

    override_values = {
        "provider": overrides.provider,
        "profile": overrides.profile,
        "vaultUrl": overrides.vault_url,
    }
    # Blank overrides are ignored, as they are on a load.
    for field, method in _OVERRIDE_METHODS.items():
        raw = override_values[field]
        text = str(getattr(raw, "value", raw)).strip() if raw else ""
        if text:
            effective[field] = _SourcedValue(
                text.lower() if field == "provider" else text, method
            )
    return effective


def _is_uri(value: str) -> bool:
    if _URI_SHAPE.fullmatch(value) is None:
        return False
    try:
        urlsplit(value)
    except ValueError:
        return False
    return True


def _describe_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, list):
        return "an array"
    if isinstance(value, dict):
        return "an object"
    if isinstance(value, bool):
        return "a boolean"
    if isinstance(value, (int, float)):
        return "a number"
    return "a string"


def _format_key(key: str) -> str:
    """Quote anything outside a plain identifier.

    Keys are untrusted input: a key carrying a line break cannot split a
    message.
    """
    return key if _SAFE_KEY.fullmatch(key) else quote_name(key)
