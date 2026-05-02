---
name: python-test-doubles
description: Test doubles with unittest.mock (Mock, AsyncMock, patch) and Mother pattern. Use when creating test data, mocking dependencies, or setting up fixtures in Python tests.
---

# Test Doubles (Python)

This skill defines how to use test doubles in Python (unittest.mock + pytest).

---

## Test Doubles Types

### 1. Mock — Mock / AsyncMock

Use `Mock` and `AsyncMock` to create mock objects for protocol interfaces.

**Purpose:** Replace real dependencies with controllable test doubles.

```python
from unittest.mock import Mock, AsyncMock


@pytest.fixture()
def secret_provider() -> Mock:
    provider = Mock(spec=ISecretProvider)
    provider.get_secret = Mock(return_value=None)
    return provider


@pytest.fixture()
def async_provider() -> AsyncMock:
    provider = AsyncMock(spec=ISecretProvider)
    provider.get_secret = AsyncMock(return_value=None)
    return provider
```

**MANDATORY:** Always use `spec=InterfaceClass` to catch typos at test time.

### 2. Stub — return_value / side_effect

Use `return_value` or `side_effect` to configure stubs.

**Purpose:** Predefined responses without caring about call verification.

```python
# Simple stub
provider.get_secret.return_value = "secret-value"

# Sequential returns
provider.get_secret.side_effect = ["first", "second", None]

# Conditional stub
def resolve_secret(name: str) -> str | None:
    secrets = {"/app/db": "postgres://...", "/app/key": "abc123"}
    return secrets.get(name)

provider.get_secret.side_effect = resolve_secret
```

### 3. Spy — wraps

Use `wraps` to observe calls on real objects without replacing behavior.

**Purpose:** Verify interactions while preserving real implementation.

```python
real_parser = MapFileParser()
spy_parser = Mock(wraps=real_parser)

sut = EnvilderClient(provider, spy_parser)
sut.resolve_secrets(map_file)

spy_parser.parse.assert_called_once_with(map_file)
```

### 4. Module Patch — patch / patch.object

Use `patch` to replace module-level objects or class methods.

**Purpose:** Replace external dependencies (boto3, file I/O, etc.).

```python
from unittest.mock import patch


@patch("boto3.client")
def Should_CallSSM_When_AwsProviderUsed(mock_boto: Mock) -> None:
    # Arrange
    mock_ssm = Mock()
    mock_boto.return_value = mock_ssm
    mock_ssm.get_parameter.return_value = {"Parameter": {"Value": "secret"}}

    # Act
    sut = AwsSsmSecretProvider()
    actual = sut.get_secret("/app/key")

    # Assert
    assert actual == "secret"
    mock_ssm.get_parameter.assert_called_once()
```

### 5. Error Simulation — side_effect with Exception

Use `side_effect` with an exception to simulate failures.

**Purpose:** Test error paths and exception handling.

```python
provider.get_secret.side_effect = ClientError(
    {"Error": {"Code": "ParameterNotFound"}}, "GetParameter"
)
```

---

## Verification Patterns

### Basic Verification

```python
provider.get_secret.assert_called_once_with("/ssm/path")
provider.get_secret.assert_called_with("/ssm/path")
logger.info.assert_called_once()
```

### Not Called

```python
provider.get_secret.assert_not_called()
logger.error.assert_not_called()
```

### Call Count

```python
assert provider.get_secret.call_count == 3
```

### Argument Inspection

```python
from unittest.mock import call

provider.get_secret.assert_has_calls([
    call("/app/db"),
    call("/app/key"),
], any_order=True)
```

### Async Verification

```python
provider.get_secret.assert_awaited_once_with("/ssm/path")
provider.get_secret.assert_awaited()
provider.get_secret.assert_not_awaited()
```

---

## Pytest Fixtures as Factories

Use fixtures to build test doubles with proper lifecycle:

```python
@pytest.fixture()
def secret_provider() -> Mock:
    provider = Mock(spec=ISecretProvider)
    provider.get_secret.return_value = None
    return provider


@pytest.fixture()
def logger() -> Mock:
    return Mock(spec=ILogger)


@pytest.fixture()
def sut(secret_provider: Mock, logger: Mock) -> EnvilderClient:
    return EnvilderClient(provider=secret_provider, logger=logger)
```

---

## Mother Pattern

Use factory functions or classes for reusable test data:

```python
from dataclasses import dataclass
from typing import Optional
from uuid import UUID, uuid4


class MapFileMother:
    @staticmethod
    def create(
        provider: str = "aws",
        mappings: Optional[dict[str, str]] = None,
    ) -> ParsedMapFile:
        return ParsedMapFile(
            config=MapFileConfig(provider=provider),
            mappings=mappings or {"DB_URL": "/app/db"},
        )


class EnvilderOptionsMother:
    @staticmethod
    def create(
        provider: SecretProviderType = SecretProviderType.AWS,
        profile: Optional[str] = None,
        vault_url: Optional[str] = None,
    ) -> EnvilderOptions:
        return EnvilderOptions(
            provider=provider,
            profile=profile,
            vault_url=vault_url,
        )
```

Usage:

```python
# Arrange
map_file = MapFileMother.create(mappings={"API_KEY": "/prod/key"})
```

---

## Summary

| Double Type | Python API | Purpose |
| ----------- | ---------- | ------- |
| Mock | `Mock(spec=X)` | Controllable replacement |
| Stub | `.return_value` / `.side_effect` | Predefined responses |
| Spy | `Mock(wraps=real)` | Observe real objects |
| Patch | `@patch("module.obj")` | Replace module-level deps |
| Error sim | `.side_effect = Exception(...)` | Failure paths |

When writing tests:

1. Create port mocks with `Mock(spec=Interface)` in fixtures
2. Configure stubs with `.return_value` in Arrange
3. **Always verify** mock interactions in Assert
4. Use Mother pattern for complex test data
5. **Always use `spec=`** to catch typo bugs
6. Prefer fixture injection over inline `Mock()` creation
