from __future__ import annotations

from collections.abc import Collection, Mapping
from typing import Protocol

from envilder.domain.contract_validation_result import SecretExistence
from envilder.domain.ports.secret_provider import ISecretProvider


class _SecretExistenceChecker(Protocol):
    """Internal port: checks that secrets exist without reading values.

    Kept apart from the public ``ISecretProvider`` so that adding it does not
    break custom providers. The built-in AWS and Azure providers implement it.
    """

    def check_secrets_exist(
        self, names: Collection[str]
    ) -> Mapping[str, SecretExistence]:
        """Return one outcome per requested provider-specific name."""
        ...


class _CheckableSecretProvider(
    ISecretProvider, _SecretExistenceChecker, Protocol
):
    """A provider that can both resolve secrets and check their existence."""
