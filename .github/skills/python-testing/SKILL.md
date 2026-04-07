---
name: python-testing
description: Mandatory testing conventions including AAA pattern, test naming, assertions, and mocks. Use for unit, integration, or E2E tests with pytest, unittest, pytest-asyncio, or Playwright.
---

# Testing Conventions (Python)

This skill defines the **MANDATORY** testing conventions for Python projects.
These are **rules**, not guidelines.

---

## Documentation Rules

### NO Docstrings, NO Comments

* **Do NOT write docstrings** - method/class names must be self-explanatory
* **Do NOT write comments** except for AAA markers (`# Arrange`, `# Act`, `# Assert`)
* The test name `Should_X_When_Y` already documents the intent

#### ❌ FORBIDDEN

```python
class TestUserService:
    
    def Should_CreateUser_When_Valid(self) -> None:
        # This creates a user  # NO explanatory comments
        user = UserFactory.build()
```

#### ✅ CORRECT

```python
class TestUserService:
    def Should_CreateUser_When_Valid(self) -> None:
        # Arrange
        user = UserFactory.build()
        
        # Act
        actual = self._sut.create(user)
        
        # Assert
        assert actual is not None
```

---

## Core Principles

### 1. AAA Pattern (Arrange – Act – Assert)

**ALL tests MUST follow the AAA pattern**, separated by inline comments.

#### Rules

* Each phase **MUST** be separated with comments
* **Never mix phases**
* For exception testing, extract the action before asserting
* If no Arrange is needed, omit it
* If there is no Assert, the test is invalid

#### pytest Example

```python
def Should_CreateGroup_When_RequestIsValid(
    group_repository: Mock,
    sut: GroupService
) -> None:
    # Arrange
    request = CreateGroupRequest(
        name="Test Group",
        type=GroupType.RECURRING
    )
    group_repository.get_group_by_id.return_value = None

    # Act
    actual = sut.create_group(request)

    # Assert
    assert actual is not None
    assert actual.id is not None
    assert actual.name == "Test Group"
    group_repository.add_group.assert_called_once()
    group_repository.save.assert_called_once()
```

---

### 2. Test Naming Convention

Test names **MUST** follow exactly:

```text
Should_{ExpectedBehavior}_When_{Condition}
```

#### Test Rules

* **PascalCase**
* **NO** natural language
* **NO** vague names
* **NO** missing `When` clause
* `test_` prefix is **FORBIDDEN**

#### pytest Discovery Configuration (MANDATORY)

```toml
[tool.pytest.ini_options]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["Should_*"]
```

If this config is missing → **tests are wrong**.

---

## Variable Naming (MANDATORY)

| Purpose            | Name       |
| ------------------ | ---------- |
| Subject under test | `sut`      |
| Expected value     | `expected` |
| Actual result      | `actual`   |

No creativity allowed here.

---

## Async Testing (pytest-asyncio)

```python
@pytest.mark.asyncio
async def Should_ReturnUser_When_UserExists(
    user_repository: AsyncMock,
    sut: GetUserHandler
) -> None:
    # Arrange
    expected = UserMother.create()
    user_repository.get_by_id.return_value = expected

    # Act
    actual = await sut.handle(expected.id)

    # Assert
    assert actual == expected
    user_repository.get_by_id.assert_awaited_once()
```

---

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

---

## Mocking & Verification (OBLIGATORY)

If you mock something, **you MUST verify it**.

```python
group_repository.add_group.assert_called_once()
group_repository.save.assert_called_once()
group_repository.delete_group.assert_not_called()
```

Async:

```python
repository.save.assert_awaited_once()
```

No verification → **test rejected**.

---

## Test Data Creation (RECOMMENDED)

Use **Mother Pattern** or **Builder Pattern** for creating test data.
Both approaches are valid and recommended over inline object creation.

### Mother Pattern

```python
from dataclasses import dataclass
from uuid import UUID, uuid4
from typing import Optional


@dataclass
class Group:
    id: UUID
    name: str
    type: GroupType


class GroupMother:
    @staticmethod
    def create(
        id: Optional[UUID] = None,
        name: Optional[str] = None,
        type: Optional[GroupType] = None,
    ) -> Group:
        return Group(
            id=id or uuid4(),
            name=name or "Test Group",
            type=type or GroupType.RECURRING,
        )
```

Usage:

```python
# Arrange
expected = GroupMother.create(name="Custom Name")
```

### Builder Pattern (polyfactory + shared `Builder[T]`)

The shared test package provides a generic `Builder[T]` that wraps `polyfactory`
to create type-safe builders for any Pydantic model. The `with_*` methods are
generated dynamically via `__getattr__`.

#### Step 1: Define Factory + Builder

```python
from polyfactory.factories.pydantic_factory import ModelFactory
from shared.factories import Builder


class GroupFactory(ModelFactory[Group]):
    __model__ = Group


class GroupBuilder(Builder[Group]):
    _factory = GroupFactory
```

### Step 2: Use in tests

```python
# Arrange - default random data
expected = GroupBuilder().build()

# Arrange - override specific fields
expected = GroupBuilder().with_name("Custom Name").with_type(GroupType.RECURRING).build()

# Arrange - build a batch
groups = GroupBuilder().with_type(GroupType.RECURRING).build_batch(5)
```

---

## Anti-Patterns (PROHIBITED)

### ❌ Missing AAA

```python
def Should_CreateGroup():
    sut = GroupService(Mock())
    sut.create_group(CreateGroupRequest(name="Test"))
```

### ❌ No mock verification

```python
def Should_SaveGroup_When_Valid(sut: GroupService):
    sut.create_group(CreateGroupRequest(name="Test"))
    assert True
```

### ❌ Natural language / snake_case

```python
def should_create_group_successfully():
    ...
```

---

## Test Organization

### Mirror Structure (MANDATORY)

Tests **MUST** mirror the production code structure using descriptive file naming.

**Production code structure:**

```txt
src/apps/myapp/
├── lambda_handler.py
├── infrastructure/
│   ├── config.py
│   ├── container.py
│   └── logging/
│       ├── json_formatter.py
│       └── logger_factory.py
├── application/
│   └── handlers/
│       └── create_user.py
└── domain/
    └── entities/
        └── user.py
```

**Test structure (hierarchical mirror):**

```txt
test/apps/myapp/
├── test_lambda_handler.py                    # mirrors lambda_handler.py
├── infrastructure/
│   ├── test_config.py                        # mirrors infrastructure/config.py
│   ├── test_container.py                     # mirrors infrastructure/container.py
│   └── logging/
│       ├── test_json_formatter.py            # mirrors infrastructure/logging/json_formatter.py
│       └── test_logger_factory.py            # mirrors infrastructure/logging/logger_factory.py
├── application/
│   └── handlers/
│       └── test_create_user.py               # mirrors application/handlers/create_user.py
└── domain/
    └── entities/
        └── test_user.py                      # mirrors domain/entities/user.py
```

**Naming convention:**

* Format: `{path}/test_{module}.py`
* Same folder structure as production code
* Test files prefixed with `test_`
* Exact mirror of production code hierarchy

#### Why hierarchical structure

* Test files live in the same logical location as production code
* Easy to find corresponding test file
* Natural organization that mirrors the codebase structure
* Clear one-to-one mapping

### pytest Configuration

**REQUIRED** configuration in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
pythonpath = ["../../../src/apps/myapp"]  # Adjust path to your src directory
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

**⚠️ Important:** The `pythonpath` must point to your production code directory to ensure imports work correctly
from test files.

### Test Classes (Optional)

Tests can be grouped in classes prefixed with `Test*`:

```python
class TestProcessInvoiceHandler:
    async def Should_SaveRequest_When_ValidInput(self) -> None:
        # Arrange / Act / Assert
        ...
```

### Test Markers

Use markers to categorize tests and run them selectively:

```python
@pytest.mark.acceptance
class TestLambdaAcceptance:
    def Should_SaveToS3_When_LambdaInvoked(self) -> None:
        ...

@pytest.mark.unit
def Should_ValidateInput_When_EmptyName() -> None:
    ...
```

Run specific markers: `pytest -m "not acceptance"` or `pytest -m unit`

---

## Final Summary

This skill enforces:

* ✅ AAA pattern with explicit comments
* ✅ Strict naming: `Should_{ExpectedBehavior}_When_{Condition}`
* ✅ `sut / actual / expected` variables
* ✅ Mock verification for all mocks
* ✅ Mother or Builder pattern for test data (recommended)
* ✅ Async support (pytest-asyncio)
* ✅ Mirror structure with hierarchical organization
* ✅ Enforceable pytest configuration

**If a test doesn't follow this → it fails review.**
