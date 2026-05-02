---
name: dotnet-testing
description: Mandatory testing conventions for .NET (xUnit, AwesomeAssertions). Use for unit, integration, or acceptance tests with xUnit, Testcontainers, or Playwright.
---

# Testing Conventions (.NET)

This skill defines the **MANDATORY** testing conventions for .NET projects.
These are **rules**, not guidelines.

---

## Documentation Rules

### NO Comments Except AAA Markers

* **NEVER write XML summaries** on test methods or test classes
* **NEVER write explanatory comments** — code must be self-explanatory
* **Only `// Arrange`, `// Act`, `// Assert`** comments are allowed in tests
* The test name `Should_X_When_Y` already documents the intent

---

## Libraries

| Category | Library | Purpose |
| -------- | ------- | ------- |
| Framework | xUnit | Test framework |
| Assertions | AwesomeAssertions | Fluent assertion syntax |
| Snapshots | Verify.Xunit | Snapshot / approval testing |
| Mocking | NSubstitute | Spies, stubs, and mocks |
| Mocking (HTTP) | WireMock.Net | HTTP service mocking |
| Test data (fake) | Bogus | Realistic fake data (Mother pattern) |
| Test data (dummy) | AutoFixture | Automatic dummy object generation |
| Containers | Testcontainers | Docker containers in tests |

---

## Core Principles

### 1. AAA Pattern (Arrange – Act – Assert)

**ALL tests MUST follow the AAA pattern**, separated by inline comments.

#### Rules

* Each phase **MUST** be separated with comments
* **Never mix phases**
* **Each comment (`// Arrange`, `// Act`, `// Assert`) appears AT MOST ONCE
  per test** — if you need two actions or two asserts, write two tests
* **Act = one single invocation on the SUT.** Multiple statements in Act only
  if they are genuinely part of the same logical action (rare and exceptional).
  Two independent operations = two tests.
* **All assertions belong in Assert only.** No `.Should()` in Arrange or Act.
  If you need a precondition check, extract it to a separate test or use a
  guard clause that throws — not an assertion.
* **AAA markers are mandatory in ALL tests** — including structural guards,
  static completeness checks, and data validation tests. No exceptions.
* **No `if`, `switch`, or conditional logic** inside Arrange, Act, or Assert
* **No `try/catch/finally`** inside tests — use `IAsyncLifetime` or
  `IDisposable` for teardown
* **No `// Act & Assert` combined blocks** — Act and Assert are ALWAYS separate
* For exceptions: `act.Should().ThrowAsync<T>()` (AwesomeAssertions)
* Omit comment if section is empty
* If a test needs branching, split it into separate tests

#### xUnit Example

```csharp
[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
public async Task Should_CreateGroup_When_RequestIsValid()
{
    // Arrange
    var request = new CreateGroupRequest { Name = "Test Group" };
    var command = new CreateGroupCommand(request);

    // Act
    var actual = await _sut.Handle(command, CancellationToken.None);

    // Assert
    actual.Should().NotBeNull();
    actual.GroupId.Should().NotBeEmpty();
    _repository.Received(1).AddGroup(Arg.Any<Group>());
}
```

---

### 2. Test Naming Convention

```text
Should_{ExpectedBehavior}_When_{Condition}
```

#### Rules

* **PascalCase** for both parts
* **NO** natural language
* **NO** vague names (`Should_Work`, `TestHandler`)
* **NO** missing `When` clause
* Method names only — xUnit uses `[Fact]` or `[Theory]`, not description strings

---

### 3. Variable Naming (MANDATORY)

| Purpose | Name |
| ------- | ---- |
| Subject under test | `_sut` (field) or `sut` (local) |
| Expected value | `expected` |
| Actual result | `actual` |

---

## Test Class Structure

```csharp
public class CreateGroupCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly IEnvilderRepository _repository;
    private readonly CreateGroupCommandHandler _sut;

    public CreateGroupCommandHandlerTests()
    {
        _fixture = new();
        _repository = Substitute.For<IEnvilderRepository>();
        _sut = new(_repository);
    }
}
```

---

## Exception Testing

**Act and Assert MUST be separate.**

### ✅ CORRECT

```csharp
[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
public async Task Should_ThrowNotFound_When_GroupDoesNotExist()
{
    // Arrange
    _repository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
        .Returns((Group?)null);

    // Act
    var act = () => _sut.Handle(query, CancellationToken.None);

    // Assert
    await act.Should().ThrowAsync<NotFoundException>();
}
```

### ❌ FORBIDDEN

```csharp
// Act & Assert   ← NEVER
await Assert.ThrowsAsync<NotFoundException>(
    () => _sut.Handle(query, CancellationToken.None));
```

---

## Teardown & Cleanup

**Never use `try/finally` in tests.** Use framework mechanisms:

| Scenario | Mechanism |
| -------- | --------- |
| Async setup/teardown | `IAsyncLifetime` (`InitializeAsync` / `DisposeAsync`) |
| Sync cleanup | `IDisposable` (`Dispose`) |
| Shared fixture | `IAsyncLifetime` on collection fixture |

```csharp
public class MyTests : IAsyncLifetime
{
    private (string Name, string? Value)[] _originalEnvValues = [];

    public Task InitializeAsync()
    {
        _originalEnvValues = EnvVarNames
            .Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
            .ToArray();
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        foreach (var (name, value) in _originalEnvValues)
        {
            Environment.SetEnvironmentVariable(name, value);
        }
        return Task.CompletedTask;
    }
}
```

---

## Verification Commands

| Context | Command |
| ------- | ------- |
| Unit tests | `dotnet test tests/sdks/dotnet/ --filter "Category!=Acceptance"` |
| Acceptance (Docker) | `dotnet test tests/sdks/dotnet/` |
| Format check | `dotnet format src/sdks/dotnet/Envilder.sln --verify-no-changes` |

---

## Completion Criteria

* Test names follow `Should_<Expected>_When_<Condition>`
* AAA markers present (except structural guards), each at most once
* `_sut`/`actual`/`expected` used consistently
* All mock interactions verified with `.Received()`
* No `try/catch/finally` or control flow in test bodies
* Tests run green: `dotnet test`
* No format regressions: `dotnet format --verify-no-changes`
