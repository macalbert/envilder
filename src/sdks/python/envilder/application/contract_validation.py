from __future__ import annotations

from envilder.domain.contract_validation_result import (
    ContractValidationResult,
    KeyCheck,
    MapFileError,
    SecretExistence,
    SecretExistenceStatus,
)
from envilder.domain.parsed_map_file import ParsedMapFile
from envilder.domain.ports.secret_existence_checker import (
    _SecretExistenceChecker,
)
from envilder.domain.secret_provider_type import SecretProviderType

_NO_RESULT_REASON = "The provider returned no result for this secret."


class ContractValidationError(Exception):
    """Raised by a load with contract validation enabled.

    The map file is invalid or a declared secret cannot be confirmed. The
    message names the failing keys and paths, never a secret value.

    Attributes:
        result: The full outcome of the check that failed.

    Example::

        from envilder import ContractValidationError, Envilder

        try:
            (
                Envilder.from_map_file("envilder.json")
                .with_contract_validation()
                .resolve()
            )
        except ContractValidationError as e:
            for key in e.result.keys:
                print(key.variable, key.status.value)
    """

    def __init__(self, result: ContractValidationResult) -> None:
        self.result = result
        super().__init__(_build_message(result))


def invalid_map_file_result(
    map_file_errors: list[MapFileError],
) -> ContractValidationResult:
    """The result for a map file that failed validation: no provider call."""
    return ContractValidationResult(
        is_valid=False, map_file_errors=tuple(map_file_errors), keys=()
    )


def check_remote_keys(
    map_file: ParsedMapFile,
    checker: _SecretExistenceChecker,
    provider: SecretProviderType,
) -> ContractValidationResult:
    """Check that every secret path of a valid map file exists.

    No value is read. A path shared by several variables is checked once.
    Returns one check per variable, in map-file order.
    """
    mappings = list(map_file.mappings.items())
    existence: dict[str, SecretExistence] = {}
    if mappings:
        distinct = list(dict.fromkeys(path for _, path in mappings))
        existence = dict(checker.check_secrets_exist(distinct))

    keys: list[KeyCheck] = []
    for variable, path in mappings:
        outcome = existence.get(path) or SecretExistence(
            SecretExistenceStatus.PROVIDER_ERROR, _NO_RESULT_REASON
        )
        keys.append(
            KeyCheck(
                variable=variable,
                path=path,
                provider=provider,
                status=outcome.status,
                reason=outcome.reason,
            )
        )
    return ContractValidationResult(
        is_valid=all(k.status is SecretExistenceStatus.EXISTS for k in keys),
        map_file_errors=(),
        keys=tuple(keys),
    )


def every_key_result(
    map_file: ParsedMapFile,
    provider: SecretProviderType,
    status: SecretExistenceStatus,
    reason: str,
) -> ContractValidationResult:
    """The result when no key can be checked, every key with one status.

    Used when the provider cannot be built with the configured credentials,
    for example an AWS profile that does not exist.
    """
    keys = tuple(
        KeyCheck(
            variable=variable,
            path=path,
            provider=provider,
            status=status,
            reason=reason,
        )
        for variable, path in map_file.mappings.items()
    )
    return ContractValidationResult(
        is_valid=False, map_file_errors=(), keys=keys
    )


def _build_message(result: ContractValidationResult) -> str:
    if result.map_file_errors:
        details = "; ".join(
            f"{error.key}: {error.message}" for error in result.map_file_errors
        )
        return f"Map file contract validation failed: {details}"
    details = ", ".join(
        f"{key.variable} ({key.path}): {key.status.value}"
        for key in result.keys
        if key.status is not SecretExistenceStatus.EXISTS
    )
    return f"Map file contract validation failed: {details}"
