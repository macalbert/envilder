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

_VALUE = "fictional-contract-value-aws"


def _write_map_file(tmp_path: Path, mappings: dict[str, str]) -> str:
    path = tmp_path / "envilder.json"
    path.write_text(json.dumps(mappings), encoding="utf-8")
    return str(path)


class TestAwsSsmContractValidationAcceptance:
    def Should_BeValid_When_EveryParameterExistsInLocalStack(
        self, ssm_client, aws_env_for_factory, tmp_path: Path
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/Contract/Db",
            Value=_VALUE,
            Type="SecureString",
            Overwrite=True,
        )
        ssm_client.put_parameter(
            Name="/Contract/Key",
            Value=_VALUE,
            Type="String",
            Overwrite=True,
        )
        path = _write_map_file(
            tmp_path, {"DB_URL": "/Contract/Db", "API_KEY": "/Contract/Key"}
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
        assert {k.provider for k in actual.keys} == {SecretProviderType.AWS}
        assert _VALUE not in repr(actual)

    def Should_ReportMissing_When_ParameterDoesNotExistInLocalStack(
        self, ssm_client, aws_env_for_factory, tmp_path: Path
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/Contract/Present",
            Value=_VALUE,
            Type="SecureString",
            Overwrite=True,
        )
        path = _write_map_file(
            tmp_path,
            {
                "PRESENT": "/Contract/Present",
                "ABSENT": "/Contract/DoesNotExist",
            },
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

    def Should_FailTheLoad_When_ContractValidationIsEnabledAndKeyIsMissing(
        self, aws_env_for_factory, tmp_path: Path
    ) -> None:
        # Arrange
        path = _write_map_file(tmp_path, {"ABSENT": "/Contract/DoesNotExist"})
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        act = sut.resolve

        # Assert
        with pytest.raises(ContractValidationError) as raised:
            act()
        assert str(raised.value) == (
            "Map file contract validation failed:"
            " ABSENT (/Contract/DoesNotExist): missing"
        )

    def Should_ResolveSecrets_When_ContractValidationIsEnabledAndKeysExist(
        self, ssm_client, aws_env_for_factory, tmp_path: Path
    ) -> None:
        # Arrange
        ssm_client.put_parameter(
            Name="/Contract/Loaded",
            Value=_VALUE,
            Type="SecureString",
            Overwrite=True,
        )
        path = _write_map_file(tmp_path, {"LOADED": "/Contract/Loaded"})
        sut = Envilder.from_map_file(path).with_contract_validation()

        # Act
        actual = sut.resolve()

        # Assert
        assert actual == {"LOADED": _VALUE}

    def Should_CheckMoreThanTenParameters_When_MapFileIsLarge(
        self, ssm_client, aws_env_for_factory, tmp_path: Path
    ) -> None:
        # Arrange
        mappings: dict[str, str] = {}
        for index in range(12):
            name = f"/Contract/Many/P{index}"
            ssm_client.put_parameter(
                Name=name, Value=_VALUE, Type="String", Overwrite=True
            )
            mappings[f"P{index}"] = name
        mappings["GONE"] = "/Contract/Many/Gone"
        path = _write_map_file(tmp_path, mappings)
        sut = Envilder.from_map_file(path)

        # Act
        actual = sut.validate_contract()

        # Assert
        missing = [
            k.variable
            for k in actual.keys
            if k.status is SecretExistenceStatus.MISSING
        ]
        assert missing == ["GONE"]
        assert len(actual.keys) == 13
