from __future__ import annotations

import json
from pathlib import Path

import pytest
from envilder import (
    ContractValidationError,
    Envilder,
    SecretExistenceStatus,
    SecretProviderType,
)

pytestmark = pytest.mark.acceptance

_VALUE = "fictional-contract-value-azure"


def _write_map_file(
    tmp_path: Path, vault_url: str, mappings: dict[str, str]
) -> str:
    document: dict[str, object] = {
        "$config": {"provider": "azure", "vaultUrl": vault_url},
        **mappings,
    }
    path = tmp_path / "envilder.json"
    path.write_text(json.dumps(document), encoding="utf-8")
    return str(path)


class TestAzureKeyVaultContractValidationAcceptance:
    def Should_BeValid_When_EverySecretExistsInLocalStack(
        self,
        azure_secret_client,
        localstack_azure_vault_url,
        tmp_path: Path,
    ) -> None:
        # Arrange
        azure_secret_client.set_secret("contract-db", _VALUE)
        azure_secret_client.set_secret("contract-key", _VALUE)
        path = _write_map_file(
            tmp_path,
            localstack_azure_vault_url,
            {"DB_URL": "/contract/db", "API_KEY": "contract-key"},
        )
        sut = Envilder.from_map_file(path)

        # Act
        actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is True
        assert [k.status for k in actual.keys] == [
            SecretExistenceStatus.EXISTS,
            SecretExistenceStatus.EXISTS,
        ]
        assert {k.provider for k in actual.keys} == {SecretProviderType.AZURE}
        assert _VALUE not in repr(actual)

    def Should_ReportMissing_When_SecretDoesNotExistInLocalStack(
        self,
        azure_secret_client,
        localstack_azure_vault_url,
        tmp_path: Path,
    ) -> None:
        # Arrange
        azure_secret_client.set_secret("contract-present", _VALUE)
        path = _write_map_file(
            tmp_path,
            localstack_azure_vault_url,
            {"PRESENT": "contract-present", "ABSENT": "contract-absent"},
        )
        sut = Envilder.from_map_file(path)

        # Act
        actual = sut.validate_contract()

        # Assert
        assert actual.is_valid is False
        statuses = {k.variable: k.status for k in actual.keys}
        assert statuses == {
            "PRESENT": SecretExistenceStatus.EXISTS,
            "ABSENT": SecretExistenceStatus.MISSING,
        }
        assert _VALUE not in repr(actual)

    def Should_FailTheLoad_When_ContractValidationIsEnabledAndSecretIsMissing(
        self, localstack_azure_vault_url, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(
            tmp_path,
            localstack_azure_vault_url,
            {"ABSENT": "contract-absent-on-load"},
        )
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        act = sut.resolve

        # Assert
        with pytest.raises(ContractValidationError) as raised:
            act()
        assert str(raised.value) == (
            "Map file contract validation failed:"
            " ABSENT (contract-absent-on-load): missing"
        )

    def Should_ResolveSecrets_When_ContractValidationIsEnabledAndSecretsExist(
        self,
        azure_secret_client,
        localstack_azure_vault_url,
        tmp_path: Path,
    ) -> None:
        # Arrange
        azure_secret_client.set_secret("contract-loaded", _VALUE)
        path = _write_map_file(
            tmp_path,
            localstack_azure_vault_url,
            {"LOADED": "contract-loaded"},
        )
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        actual = sut.resolve()

        # Assert
        assert actual == {"LOADED": _VALUE}
