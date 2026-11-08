from __future__ import annotations

from collections.abc import Collection, Mapping
from typing import Protocol, runtime_checkable

from envilder.domain.contract_validation_result import SecretExistence
from envilder.domain.ports.secret_provider import ISecretProvider


@runtime_checkable
class ISecretExistenceChecker(Protocol):
    """Checks that secrets exist without reading their values.

    Kept apart from ``ISecretProvider`` so custom providers do not have to
    implement it. The built-in AWS and Azure providers implement it. A custom
    provider passed to ``with_secret_provider()`` implements it to take part
    in contract validation.
    """

    def check_secrets_exist(
        self, names: Collection[str]
    ) -> Mapping[str, SecretExistence]:
        """Return one outcome per requested provider-specific name."""
        ...


class _CheckableSecretProvider(
    ISecretProvider, ISecretExistenceChecker, Protocol
):
    """A provider that can both resolve secrets and check their existence."""
