# Testing Conventions Examples

This document contains full code examples for testing patterns.

## Backend Examples (C# / xUnit)

### Test Class Structure

```csharp
public class CreateGroupCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly CreateGroupCommandHandler _sut;
    private readonly IXXTemplateXXRepository _repository;
    private readonly ILogger<CreateGroupCommandHandler> _logger;

    public CreateGroupCommandHandlerTests()
    {
        _fixture = new();
        _repository = Substitute.For<IXXTemplateXXRepository>();
        _logger = Substitute.For<ILogger<CreateGroupCommandHandler>>();
        _sut = new(_repository, _logger);
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_CreateGroup_When_RequestIsValid()
    {
        // Arrange
        var request = new CreateGroupRequest
        {
            Name = "Test Group",
            Type = GroupType.Recurring
        };
        var command = new CreateGroupCommand(request);

        _repository
            .GetGroupByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((Group?)null);

        // Act
        var actual = await _sut.Handle(command, CancellationToken.None);

        // Assert
        actual.Should().NotBeNull();
        actual.GroupId.Should().NotBeEmpty();
        _repository.Received(1).AddGroup(Arg.Any<Group>());
        await _repository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_ThrowArgumentException_When_NameIsEmpty()
    {
        // Arrange
        var request = new CreateGroupRequest { Name = "" };
        var command = new CreateGroupCommand(request);

        // Act
        var action = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await action.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*name*required*");
    }
}
```

### Query Handler Test

```csharp
[Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
public async Task Should_GetGroupById_When_GroupExists()
{
    // Arrange
    var groupId = Guid.NewGuid();
    var expected = GroupMother.Create(id: groupId);
    
    _repository
        .GetGroupByIdAsync(groupId, Arg.Any<CancellationToken>())
        .Returns(expected);

    var query = new GetGroupByIdQuery(groupId);

    // Act
    var actual = await _sut.Handle(query, CancellationToken.None);

    // Assert
    actual.Should().NotBeNull();
    actual.Id.Should().Be(expected.Id);
    actual.Name.Should().Be(expected.Name);
}

[Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
public async Task Should_ThrowNotFound_When_GroupDoesNotExist()
{
    // Arrange
    var query = new GetGroupByIdQuery(Guid.NewGuid());
    
    _repository
        .GetGroupByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
        .Returns((Group?)null);

    // Act
    var action = () => _sut.Handle(query, CancellationToken.None);

    // Assert
    await action.Should().ThrowAsync<GroupNotFoundException>();
}
```

### AwesomeAssertions Examples

```csharp
// Basic assertions
actual.Should().NotBeNull();
actual.Id.Should().NotBeEmpty();
actual.Name.Should().Be("Test Group");
actual.Type.Should().Be(GroupType.Recurring);
actual.Status.Should().BeOneOf(Status.Active, Status.Pending);

// Collection assertions
groups.Should().HaveCount(2);
groups.Should().NotBeEmpty();
groups.Should().Contain(g => g.Id == expectedId);
groups.Should().OnlyContain(g => g.Status == Status.Active);
groups.Should().BeInAscendingOrder(g => g.CreatedAt);

// String assertions
actual.Name.Should().StartWith("Test");
actual.Name.Should().Contain("Group");
actual.Name.Should().MatchRegex(@"^Test.*$");

// Exception assertions
var action = () => _sut.Handle(command, CancellationToken.None);
await action.Should().ThrowAsync<ArgumentException>()
    .WithMessage("Group name is required");
```

### Mock Verification Examples

```csharp
// Verify method was called once
_repository.Received(1).AddGroup(Arg.Any<Group>());

// Verify async method was called
await _repository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());

// Verify method was NOT called
_repository.DidNotReceive().DeleteGroup(Arg.Any<Group>());

// Verify logger call
_logger.Received(1).Log(
    LogLevel.Information,
    Arg.Any<EventId>(),
    Arg.Is<object>(o => o.ToString()!.Contains("Creating group")),
    Arg.Any<Exception>(),
    Arg.Any<Func<object, Exception?, string>>());
```

## Frontend Examples (TypeScript / Jest)

### React Hook Test

```typescript
describe("useAuth", () => {
  it("Should_LoginSuccessfully_When_CredentialsAreValid", async () => {
    // Arrange
    const mockUser = { id: "123", username: "testuser" };
    mockLogin.mockResolvedValue({
      data: { accessToken: "token", user: mockUser },
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Act
    let actual: boolean = false;
    await act(async () => {
      actual = await result.current.login("test@test.com", "password123");
    });

    // Assert
    expect(actual).toBe(true);
    expect(mockLogin).toHaveBeenCalledWith("test@test.com", "password123");
    expect(result.current.user).toEqual(mockUser);
  });
});
```

### React Component Test

```typescript
describe("CreateGroupForm", () => {
  it("Should_CreateGroup_When_FormIsSubmitted", async () => {
    // Arrange
    const mockCreateGroup = jest.fn().mockResolvedValue({ id: "123" });
    const { getByRole, getByLabelText } = render(
      <CreateGroupForm onSubmit={mockCreateGroup} />
    );
    
    const nameInput = getByLabelText("Group Name");
    const submitButton = getByRole("button", { name: "Create" });

    // Act
    await userEvent.type(nameInput, "Test Group");
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith({ name: "Test Group" });
    });
  });
});
```

### Playwright E2E Test

```typescript
test("Should_CreateGroup_When_ClickingCreateButton", async ({ page }) => {
  // Arrange
  await page.goto("/groups");
  const createButton = page.getByRole("button", { name: "Create Group" });
  const nameInput = page.getByLabel("Group Name");

  // Act
  await nameInput.fill("Test Group");
  await createButton.click();

  // Assert
  await expect(page.getByText("Group created successfully")).toBeVisible();
});
```

## Mother Pattern Example

```csharp
public sealed class GroupMother
{
    public static Group Create(
        Guid? id = null,
        string? name = null,
        GroupType? type = null)
    {
        return Group.Create(
            id: id ?? Guid.CreateVersion7(),
            name: name ?? "Test Group",
            type: type ?? GroupType.Recurring
        );
    }
}

// Usage in tests
var group = GroupMother.Create();
var customGroup = GroupMother.Create(id: specificId, name: "Custom Name");
```

## Test Folder Structure

```txt
test/
├── XXTemplateXX.Tests/
│   ├── Application/
│   │   ├── Group/
│   │       ├── Create/
│   │       │   └── CreateGroupCommandHandlerTests.cs
│   │       └── GetById/
│   │           └── GetGroupByIdQueryHandlerTests.cs
│   ├── Domain/
│   │   ├── Mothers/
│   │   │   ├── GroupMother.cs
│   │   │   └── PriceMother.cs
│   │   └── GroupTests.cs
│   └── Infrastructure/
│       └── EntityFramework/
│           └── XXTemplateXXRepositoryTests.cs
└── apps/
    └── Minimal.Api.Tests.Acceptance/
        └── Endpoints/
            └── Groups/
                └── CreateGroupEndpointTests.cs
```
