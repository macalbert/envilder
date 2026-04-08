# Testing Stack: Python

Libraries and tools for testing Python Lambda functions and backend code.

## Libraries

| Category | Library | Purpose |
| -------- | ------- | ------- |
| **Framework** | pytest | Test runner |
| **Async** | pytest-asyncio | Async test support |
| **Coverage** | pytest-cov | Code coverage |
| **Snapshots** | pytest-snapshot | Snapshot / approval testing |
| **Mocking** | unittest.mock (Mock, AsyncMock) | Built-in mocking |
| **Formatter** | black | Code formatter |
| **Type checking** | mypy | Static type analysis |
| **Test data (builders)** | polyfactory + shared `Builder[T]` | Generic builder for any Pydantic model |
| **Models / Validation** | Pydantic | Data validation and model definitions |

## Test Types

| Type | Tools | Infra |
| ---- | ----- | ----- |
| Unit | pytest + Mock/AsyncMock | No |
| Integration | pytest + Testcontainers (LocalStack) | Docker |
| Acceptance | pytest + Docker Compose (full stack) | Docker |

## pytest Assertions

```python
assert actual is not None
assert actual == expected
assert actual.name == "Test Group"
assert len(collection) == 2
assert any(item.id == expected_id for item in collection)
```

## Exception Testing

```python
def Should_RaiseValueError_When_NameIsEmpty(sut: GroupService) -> None:
    # Arrange
    request = CreateGroupRequest(name="", type=GroupType.RECURRING)

    # Act
    action = lambda: sut.create_group(request)

    # Assert
    with pytest.raises(ValueError, match="Group name is required"):
        action()
```

## Async Exception Testing

```python
@pytest.mark.asyncio
async def Should_RaiseNotFound_When_UserMissing(sut: GetUserHandler) -> None:
    # Arrange
    user_repository.get_by_id.return_value = None

    # Act
    action = sut.handle(uuid4())

    # Assert
    with pytest.raises(NotFoundException):
        await action
```

## Mock / AsyncMock

```python
from unittest.mock import Mock, AsyncMock

# Stub
repository = Mock()
repository.get_by_id.return_value = expected

# Async stub
repository = AsyncMock()
repository.get_by_id.return_value = expected

# Verify
repository.add.assert_called_once()
repository.save.assert_called_once()
repository.delete.assert_not_called()

# Async verify
repository.save.assert_awaited_once()
```

## Snapshot Testing

```python
def Should_MatchSnapshot_When_ResponseGenerated(snapshot) -> None:
    # Arrange
    handler = CreateInvoiceHandler(repository=Mock())

    # Act
    actual = handler.handle(request)

    # Assert
    snapshot.assert_match(actual.model_dump_json(indent=2), "invoice_response.json")
```

## Builder Pattern (polyfactory + shared `Builder[T]`)

The shared test package (`xxtemplatexx-shared-test-ai`) provides a generic `Builder[T]`
that wraps `polyfactory` to create type-safe builders for any Pydantic model.

### 1. Define Factory + Builder

```python
from polyfactory.factories.pydantic_factory import ModelFactory
from shared.factories import Builder

from core.domain.models.invoice import Invoice, InvoiceProduct


class InvoiceProductFactory(ModelFactory[InvoiceProduct]):
    __model__ = InvoiceProduct


class InvoiceProductBuilder(Builder[InvoiceProduct]):
    _factory = InvoiceProductFactory


class InvoiceFactory(ModelFactory[Invoice]):
    __model__ = Invoice


class InvoiceBuilder(Builder[Invoice]):
    _factory = InvoiceFactory
```

### 2. Usage in tests

```python
# Default random data (polyfactory generates all fields)
invoice = InvoiceBuilder().build()

# Override specific fields with with_* (dynamic via __getattr__)
invoice = InvoiceBuilder().with_amount(100.0).with_description("Vaccination").build()

# Build a batch
invoices = InvoiceBuilder().with_status("pending").build_batch(5)

# Compose builders
products = [InvoiceProductBuilder().with_name("Vaccination").with_price(50.0).build()]
invoice = InvoiceBuilder().with_products(products).build()
```

### How it works

The shared `Builder[T]` base class (in `shared/factories/builder.py`):

- Wraps any `polyfactory.factories.base.BaseFactory[T]` subclass
- `with_*` methods are generated dynamically via `__getattr__` (fluent API)
- `.build()` delegates to the factory with accumulated overrides
- `.build_batch(n)` creates multiple instances

## black (Formatter)

```bash
# Format
black .

# Check only
black --check .
```

Configuration in `pyproject.toml`:

```toml
[tool.black]
line-length = 88
target-version = ["py312"]
include = '\.pyi?$'
```

## mypy (Type Checking)

```bash
# Type check
mypy .

# Strict mode
mypy --strict .
```

Configuration in `pyproject.toml`:

```toml
[tool.mypy]
python_version = "3.12"
warn_return_any = false
warn_unused_configs = true
no_implicit_optional = true
warn_redundant_casts = true
```

## pytest Configuration

```toml
[tool.pytest.ini_options]
testpaths = ["."]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["Should_*"]
asyncio_mode = "auto"
markers = [
    "acceptance: marks tests as acceptance tests (require Docker)",
    "unit: marks tests as unit tests (fast, no dependencies)",
    "integration: marks tests as integration tests",
]
```
