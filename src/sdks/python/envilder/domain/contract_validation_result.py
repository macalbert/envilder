from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from envilder.domain.secret_provider_type import SecretProviderType


class SecretExistenceStatus(str, Enum):
    """Whether a secret declared in the map file can be resolved.

    Checked without reading its value. Same statuses as ``envilder validate``:

    - ``EXISTS``: the secret is there and the identity can see it.
    - ``MISSING``: the provider answered that there is no such secret.
    - ``ACCESS_DENIED``: the identity is not allowed to check the secret, so
      whether it exists is unknown. Never reported as ``MISSING``.
    - ``AUTHENTICATION_FAILED``: the provider rejected the credentials.
    - ``PROVIDER_ERROR``: anything else, for example an unreachable provider.
    """

    EXISTS = "exists"
    MISSING = "missing"
    ACCESS_DENIED = "access_denied"
    AUTHENTICATION_FAILED = "authentication_failed"
    PROVIDER_ERROR = "provider_error"


@dataclass(frozen=True)
class SecretExistence:
    """The outcome of checking one secret path.

    ``reason`` explains a status other than ``EXISTS`` or ``MISSING`` when the
    provider gave one; it never carries a secret value.
    """

    status: SecretExistenceStatus
    reason: str | None = None


@dataclass(frozen=True)
class MapFileError:
    """One reason the map file cannot be used.

    ``key`` names the offending entry (``DB_URL``, ``$config.profile``,
    ``with_profile()``, or ``(root)`` for the document itself). Neither field
    ever carries a mapped value.
    """

    key: str
    message: str


@dataclass(frozen=True)
class KeyCheck:
    """One variable of the map file with the outcome for its secret path."""

    variable: str
    path: str
    provider: SecretProviderType
    status: SecretExistenceStatus
    reason: str | None = None


@dataclass(frozen=True)
class ContractValidationResult:
    """The outcome of checking a map file contract.

    The contract holds when the map file is valid and every declared secret
    exists. When the map file is invalid, ``keys`` is empty because no
    provider was called.

    Example::

        from envilder import Envilder

        result = Envilder.from_map_file("envilder.json").validate_contract()
        if not result.is_valid:
            failing = [k.variable for k in result.keys if k.status != "exists"]
            print(result.map_file_errors, failing)
    """

    is_valid: bool
    map_file_errors: tuple[MapFileError, ...] = ()
    keys: tuple[KeyCheck, ...] = ()
