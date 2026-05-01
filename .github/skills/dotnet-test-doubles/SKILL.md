---
name: dotnet-test-doubles
description: Test doubles including Fakes (Bogus), Dummies (AutoFixture), Stubs, Spies, and Mocks (NSubstitute). Use when creating test data, mocking dependencies, or setting up HTTP mocks with WireMock.Net.
---

# Test Doubles

This skill defines how to use test doubles (Fakes, Dummies, Stubs, Spies, and Mocks).

## Code Style Rules

**NEVER write unnecessary comments or XML summaries.** Code should be self-explanatory.

| Rule | Example |
| ---- | ------ |
| Use `class` not `record` | `public class GroupMother { ... }` |
| Always use `{}` brackets | `if (x) { return; }` never `if (x) return;` |
| Aligned wrapped parameters | Align parameters with opening parenthesis |

## Test Doubles Types

### 1. Fake - Bogus

Use **Bogus** to create realistic fake data for testing.

**Purpose:** Generate realistic test data that mimics production data.

**Example:**

```csharp
using Bogus;

public sealed class GroupMother
{
    private readonly Faker _faker;

    public GroupMother(int seed = 666)
    {
        _faker = new Faker { Random = new Randomizer(seed) };
    }

    public Group Create()
    {
        return Group.Create(
            id: _faker.Random.Guid(),
            name: _faker.Commerce.ProductName(),
            type: _faker.PickRandom<GroupType>()
        );
    }
}
```

### 2. Dummy - AutoFixture

Use **AutoFixture** for dummy objects that fill method parameters.

**Purpose:** Automatically generate objects without manual setup.

**Example:**

```csharp
public class CreateGroupCommandHandlerTests
{
    private readonly Fixture _fixture;

    public CreateGroupCommandHandlerTests()
    {
        _fixture = new Fixture();
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_CreateGroup_When_RequestIsValid()
    {
        // Arrange
        var secretName = _fixture.Create<string>();
        var secretValue = _fixture.Create<string>();
        // ...
    }
}
```

### 3. Stub - AutoFixture / NSubstitute

Use **AutoFixture** or **NSubstitute** for stubs that return predefined data.

**Example with NSubstitute:**

```csharp
// Arrange
_repository
    .GetGroupByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
    .Returns(GroupMother.Create(id: expectedId));
```

### 4. Spy - NSubstitute

Use **NSubstitute** to spy on method calls and verify interactions.

**Example:**

```csharp
// Arrange
var logger = Substitute.For<ILogger<CreateGroupCommandHandler>>();

// Act
await _sut.Handle(command, CancellationToken.None);

// Assert - Verify logger was called
logger.Received(1).Log(
    LogLevel.Information,
    Arg.Any<EventId>(),
    Arg.Is<object>(o => o.ToString()!.Contains("Creating group")),
    Arg.Any<Exception>(),
    Arg.Any<Func<object, Exception?, string>>());
```

### 5. Mock - NSubstitute

Use **NSubstitute** for mocks that verify expected behavior.

**Example:**

```csharp
// Arrange
_repository
    .GetGroupByIdAsync(groupId, Arg.Any<CancellationToken>())
    .Returns(group);

// Act
var actual = await _sut.Handle(query, CancellationToken.None);

// Assert
await _repository.Received(1).GetGroupByIdAsync(groupId, Arg.Any<CancellationToken>());
```

### 6. HTTP Mocks - WireMock.Net

Use **WireMock.Net** for mocking HTTP services.

**Example:**

```csharp
// Setup WireMock
_wireMock
    .Given(Request.Create()
        .WithPath("/secrets/my-secret")
        .UsingGet())
    .RespondWith(Response.Create()
        .WithStatusCode(200)
        .WithBodyAsJson(new { value = "secret-value" }));

// Test HTTP client
var response = await _httpClient.GetAsync("/secrets/my-secret");
```

## NSubstitute Patterns

### Basic Mocking

```csharp
// Create mock
var repository = Substitute.For<IEnvilderRepository>();

// Setup return value
repository
    .GetGroupByIdAsync(groupId, Arg.Any<CancellationToken>())
    .Returns(group);

// Verify call
await repository.Received(1).GetGroupByIdAsync(groupId, Arg.Any<CancellationToken>());

// Verify NOT called
await repository.DidNotReceive().DeleteGroup(Arg.Any<Group>());
```

### Argument Matchers

```csharp
// Any argument
repository.GetGroupByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());

// Specific value
repository.GetGroupByIdAsync(specificId, Arg.Any<CancellationToken>());

// Conditional matching
repository.GetGroupByIdAsync(
    Arg.Is<Guid>(id => id != Guid.Empty),
    Arg.Any<CancellationToken>());
```

For more details on AutoFixture and Bogus patterns, see [reference.md](reference.md).

## Mother Pattern with Bogus

```csharp
public sealed class GroupMother
{
    private readonly Faker _faker;

    public GroupMother(int seed = 666)
    {
        _faker = new Faker { Random = new Randomizer(seed) };
    }

    public Group Create(
        Guid? id = null,
        string? name = null,
        GroupType? type = null)
    {
        return Group.Create(
            id: id ?? _faker.Random.Guid(),
            name: name ?? _faker.Commerce.ProductName(),
            type: type ?? _faker.PickRandom<GroupType>()
        );
    }

    public IEnumerable<Group> CreateMany(int count = 10)
    {
        for (var i = 0; i < count; i++)
        {
            yield return Create();
        }
    }
}
```

## Summary

- **Bogus** for realistic fake data
- **AutoFixture** for dummy and stub objects
- **NSubstitute** for spies and mocks
- **WireMock.Net** for HTTP mocks
- **Mother pattern** for reusable test data builders
- **Verify interactions** using `.Received()`
- **Argument matchers** for flexible verification

When writing tests:

1. Use Mother pattern for domain entities
2. Use AutoFixture for simple data
3. Use Bogus for realistic data
4. Use NSubstitute for all mocks/spies
5. Always verify mock interactions
