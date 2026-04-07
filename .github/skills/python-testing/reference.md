# Python Testing — Quick Reference

## pytest Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
pythonpath = ["../../../src/apps/ai-process-lambda"]
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

## Commands

```bash
# Run all tests
pytest

# Run only unit tests
pytest -m unit

# Run excluding acceptance (no Docker needed)
pytest -m "not acceptance"

# Run specific file
pytest unit/domain/services/document_verification/test_document_verification_service.py

# Run with verbose output
pytest -v -s
```

## Fixtures Cheat Sheet

```python
# Simple mock
@pytest.fixture
def repository() -> Mock:
    return Mock()

# Async mock
@pytest.fixture
def repository() -> AsyncMock:
    return AsyncMock()

# SUT with injected mocks
@pytest.fixture
def sut(repository: Mock, logger: Mock) -> MyService:
    return MyService(repository=repository, logger=logger)

# Auto-use (applies to all tests in module)
@pytest.fixture(autouse=True)
def mock_external_service() -> Generator[Mock, None, None]:
    with patch("module.path.service") as mock:
        yield mock
```

## Builder Pattern

```python
# Step 1: Define factory + builder
from polyfactory.factories.pydantic_factory import ModelFactory
from shared.factories import Builder

class MyModelFactory(ModelFactory[MyModel]):
    __model__ = MyModel

class MyModelBuilder(Builder[MyModel]):
    _factory = MyModelFactory

# Step 2: Use in tests
model = MyModelBuilder().with_name("Test").with_status("active").build()
models = MyModelBuilder().with_status("active").build_batch(5)
```

## Mock Verification Patterns

```python
# Called once
repository.save.assert_called_once()

# Called with specific args
repository.save.assert_called_once_with(expected_entity)

# Not called
repository.delete.assert_not_called()

# Async called once
repository.save.assert_awaited_once()

# Call count
assert repository.save.call_count == 3

# Access call args
call_args = repository.save.call_args
assert call_args.kwargs["images"] == [b"page1"]
```

## Exception Testing

```python
def Should_RaiseValueError_When_InputInvalid(sut: MyService) -> None:
    # Arrange
    request = InvalidRequest()

    # Act
    action = lambda: sut.process(request)

    # Assert
    with pytest.raises(ValueError, match="specific message"):
        action()
```

## Shared Test Infrastructure

| Component | Location |
| --------- | -------- |
| Generic Builder | `shared/test/python/shared/factories/builder.py` |
| Lambda Container | `shared/test/python/shared/containers/lambda_container/` |
| LocalStack Container | `shared/test/python/shared/containers/localstack/` |
| WireMock Container | `shared/test/python/shared/containers/wiremock/` |
