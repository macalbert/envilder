from envilder import (
    ContractValidationResult,
    KeyCheck,
    MapFileError,
    SecretExistenceStatus,
    SecretProviderType,
)
from envilder.application.contract_validation import (
    ContractValidationError,
    invalid_map_file_result,
)


def _key(variable: str, path: str, status: SecretExistenceStatus) -> KeyCheck:
    return KeyCheck(variable, path, SecretProviderType.AWS, status)


class TestContractValidationError:
    def Should_ListKeysAndPaths_When_KeysFail(self) -> None:
        # Arrange
        result = ContractValidationResult(
            is_valid=False,
            keys=(
                _key("DB_URL", "/app/db", SecretExistenceStatus.MISSING),
                _key("OK", "/app/ok", SecretExistenceStatus.EXISTS),
                _key(
                    "API_KEY", "/app/key", SecretExistenceStatus.ACCESS_DENIED
                ),
            ),
        )

        # Act
        actual = ContractValidationError(result)

        # Assert
        assert str(actual) == (
            "Map file contract validation failed: DB_URL (/app/db): missing,"
            " API_KEY (/app/key): access_denied"
        )
        assert actual.result is result

    def Should_ListMapFileErrors_When_MapFileIsInvalid(self) -> None:
        # Arrange
        result = invalid_map_file_result(
            [MapFileError("A", "bad a."), MapFileError("(root)", "bad root.")]
        )

        # Act
        actual = ContractValidationError(result)

        # Assert
        assert str(actual) == (
            "Map file contract validation failed: A: bad a.; (root): bad root."
        )
        assert result.is_valid is False
        assert result.keys == ()
