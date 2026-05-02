---
name: common-testing-conventions
description: Mandatory testing conventions including AAA pattern, test naming, and assertions across all stacks (.NET, TypeScript, Python). Use when writing unit tests, integration tests, E2E tests, or verifying mock interactions.
user-invocable: false
---

# Testing Conventions Skill

Mandatory testing conventions across all stacks. Stack-specific libraries and examples
are documented in dedicated supporting files.

## Code Style Rules

**NEVER write unnecessary comments or XML summaries.**
Exception: `// Arrange`, `// Act`, `// Assert` comments are REQUIRED in tests.

| Rule | Example |
| ---- | ------ |
| Use `class` not `record` | `public class OrderMother { ... }` |
| Always use `{}` brackets | `if (x) { return; }` never `if (x) return;` |
| Aligned wrapped parameters | Align parameters with opening parenthesis |

## When to Use

- Writing unit tests for handlers, services, or components
- Writing integration tests with WebApplicationFactory
- Writing E2E tests with Playwright
- Setting up test class structure
- Verifying mock interactions

## Supporting Files

| File | Description |
| ---- | ----------- |
| [dotnet.md](./dotnet.md) | .NET testing stack (xUnit, AwesomeAssertions, NSubstitute, Bogus, Verify.Xunit, WireMock, Testcontainers) |
| [typescript.md](./typescript.md) | TypeScript testing stack — CLI, SDK, CDK, Website (Vitest, Playwright, Biome) |
| [python.md](./python.md) | Python testing stack (pytest, Mock/AsyncMock, pytest-snapshot, black, mypy, Pydantic) |
| [examples.md](./examples.md) | Full test examples for C# and TypeScript |
| [reference.md](./reference.md) | Naming rules, anti-patterns, checklist |

## Core Principles

### 1. AAA Pattern (Mandatory)

All tests **MUST** follow Arrange-Act-Assert with clear comments:

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

**Rules:**

- **Each comment (`// Arrange`, `// Act`, `// Assert`) appears AT MOST ONCE per test** — if you need two actions,
  write two tests
- **Act = one single invocation on the SUT.** Multiple statements in Act only if they are genuinely
  part of the same logical action (rare and exceptional). Two independent operations = two tests.
- **AAA markers are mandatory in ALL tests** — including structural guards,
  static completeness checks, and data validation tests. No exceptions.
- Each section clearly separated by comments
- Never mix phases
- **All assertions belong in Assert only.** No `expect()`, `.Should()`, `assert`, or any verification
  statement in Arrange or Act. If you feel tempted to assert in Arrange (precondition check), extract
  it to a separate test or use a guard clause that throws — not an assertion.
- **No `if`, `switch`, or conditional logic** inside Arrange, Act, or Assert blocks
- **No `try/catch/finally`** inside tests — use framework teardown (`IAsyncLifetime`, `[ClassCleanup]`, pytest `yield` fixtures)
- **No `// Act & Assert` combined blocks** — Act and Assert are ALWAYS separate phases
- For exceptions: C# → `AwesomeAssertions` `.Should().ThrowAsync<T>()` | Python → `lambda` + `pytest.raises()` | Vitest
 → `expect(...).rejects.toThrow()`
- Omit comment if section is empty
- If a test needs branching, split it into separate test methods (one per scenario)

### 2. Test Naming Convention

```txt
Should_{ExpectedBehavior}_When_{Condition}
```

| ✓ Good                                       | ✗ Bad             |
| -------------------------------------------- | ----------------- |
| `Should_CreateGroup_When_RequestIsValid`     | `TestCreateGroup` |
| `Should_ThrowNotFound_When_UserDoesNotExist` | `"should login"`  |
| `Should_ReturnEmptyList_When_NoRecordsFound` | `Should_Work`     |

### 3. Standard Variables

| Purpose | Name |
| ------- | ---- |
| Subject under test | `sut` |
| Expected value | `expected` |
| Actual result | `actual` |

```csharp
var expected = GroupMother.Create(id: groupId);
var actual = await _sut.Handle(query, CancellationToken.None);
actual.Id.Should().Be(expected.Id);
```

## Test Class Structure (C#)

```csharp
public class CreateGroupCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly CreateGroupCommandHandler _sut;
    private readonly IEnvilderRepository _repository;

    public CreateGroupCommandHandlerTests()
    {
        _fixture = new();
        _repository = Substitute.For<IEnvilderRepository>();
        _sut = new(_repository);
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_CreateGroup_When_RequestIsValid()
    {
        // Test implementation
    }
}
```

## Libraries by Stack

See the dedicated supporting file for each stack:

- **.NET Backend:** [dotnet.md](./dotnet.md) — xUnit, AwesomeAssertions, NSubstitute,
  AutoFixture, Bogus, Verify.Xunit, WireMock.Net, Testcontainers (PostgreSQL,
  LocalStack)
- **TypeScript (CLI, SDK, CDK, Website):** [typescript.md](./typescript.md) — Vitest
  (CLI/SDK/CDK/Website), Playwright, Biome
- **Python:** [python.md](./python.md) — pytest, pytest-asyncio, pytest-snapshot,
  unittest.mock, black, mypy, Pydantic

## Related Skills

| Stack | Conventions | Test Doubles |
| ----- | ----------- | ------------ |
| .NET | **dotnet-testing** | **dotnet-test-doubles** |
| TypeScript | **typescript-testing** | **typescript-test-doubles** |
| Python | **python-testing** | **python-test-doubles** |

Cross-stack:

- **sdk-acceptance-testing:** TestContainers, LocalStack, Lowkey Vault (all SDKs)
- **typescript-cdk-testing:** CDK snapshot + fine-grained assertions (Vitest)
- **core-testing:** Envilder CLI/Core specific testing procedure (Vitest)
