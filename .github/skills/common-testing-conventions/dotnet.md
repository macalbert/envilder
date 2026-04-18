# Testing Stack: .NET Backend

Libraries and tools for testing .NET backend code.

## Libraries

| Category | Library | Purpose |
| -------- | ------- | ------- |
| **Framework** | xUnit | Test framework |
| **Assertions** | AwesomeAssertions | Fluent assertion syntax |
| **Snapshots** | Verify.Xunit | Snapshot / approval testing |
| **Mocking** | NSubstitute | Spies, stubs, and mocks |
| **Mocking (HTTP)** | WireMock.Net | HTTP service mocking |
| **Test data (fake)** | Bogus | Realistic fake data generation (Mother pattern) |
| **Test data (dummy)** | AutoFixture | Automatic dummy object generation |
| **Containers** | Testcontainers | Docker containers in tests |
| **Containers** | Testcontainers.PostgreSql | PostgreSQL integration tests |
| **Containers** | Testcontainers.LocalStack | AWS services integration tests |

## Test Types

| Type | Tools | Docker |
| ---- | ----- | ------ |
| Unit | xUnit + NSubstitute + AwesomeAssertions + AutoFixture + Bogus | No |
| Integration / Acceptance | xUnit + Testcontainers (PostgreSQL, LocalStack, WireMock) | Yes |
| E2E | Playwright | Yes (full Docker Compose stack) |

## AwesomeAssertions

```csharp
actual.Should().NotBeNull();
actual.Should().Be(expected);
actual.Should().BeOneOf(Status.Active, Status.Pending);
collection.Should().HaveCount(2);
collection.Should().Contain(x => x.Id == id);
action.Should().ThrowAsync<ArgumentException>();
```

## NSubstitute

```csharp
// Stub
_repository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
    .Returns(expected);

// Verify
_repository.Received(1).Add(Arg.Any<Entity>());
_repository.DidNotReceive().Delete(Arg.Any<Entity>());
```

## Verify.Xunit (Snapshots)

```csharp
[Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
public async Task Should_ReturnExpectedResponse_When_ProcessExists()
{
    // Arrange
    var query = new GetProcessQuery(Guid.CreateVersion7());

    // Act
    var actual = await _sut.Handle(query, _cancellationToken);

    // Assert
    await Verify(actual);
}
```

## Mother Pattern (Bogus)

```csharp
public sealed class ProcessMother
{
    private static readonly Faker<Process> _faker = new Faker<Process>()
        .CustomInstantiator(f => Process.Create(
            id: Guid.CreateVersion7(),
            claimId: f.Random.Guid().ToString(),
            fileUrl: f.Internet.Url(),
            type: ProcessType.Claims));

    public static Process Random() => _faker.Generate();
}
```

## Dummy Pattern (AutoFixture)

```csharp
private readonly Fixture _fixture = new();
var config = _fixture.Create<ClaimDocumentStorageConfig>();
```

## Integration Test Infrastructure

```csharp
public class ApiServicesFactory : LocalStackWebBaseServicesFactory<IMinimalApiMarker>
{
    private readonly PostgreSqlContainer _postgreSqlContainer = new PostgreSqlBuilder().Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);

        builder.ConfigureTestServices(services =>
        {
            services.RedirectToLocalStack(Localstack.Credentials, Localstack.Uri);

            services.Remove<DbContextOptions<XXTemplateXXDbContext>>();
            services.AddDbContext<XXTemplateXXDbContext>((sp, options) =>
            {
                options.UseNpgsql(_postgreSqlContainer.GetConnectionString());
                options.AddInterceptors(sp.GetRequiredService<DomainEventInterceptor>());
            });
        });
    }

    protected override async Task OtherInitializeAsync(CancellationToken cancellationToken)
    {
        await _postgreSqlContainer.StartAsync(cancellationToken);
        GetService<XXTemplateXXDbContext>().Database.Migrate();
    }
}
```

## Test Cleanup — No `try/catch/finally` in Tests

**NEVER** use `try/catch`, `try/finally`, `if`, `switch`, or any control flow inside test methods.
Use framework teardown mechanisms instead:

| Scenario | Mechanism |
| -------- | --------- |
| Async setup/teardown per test | `IAsyncLifetime` (`InitializeAsync` / `DisposeAsync`) |
| Sync cleanup per test | `IDisposable` (`Dispose`) |
| Shared fixture cleanup | `IAsyncLifetime` on collection fixture class |
| Environment variable restore | Save in `InitializeAsync`, restore in `DisposeAsync` |

```csharp
// GOOD — cleanup via IAsyncLifetime
public class MyTests : IAsyncLifetime
{
    private (string Name, string? Value)[] _originalEnvValues = [];

    public Task InitializeAsync()
    {
        _originalEnvValues = EnvVarNames
            .Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
            .ToArray();
        Environment.SetEnvironmentVariable("MY_VAR", "test-value");
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

    [Fact]
    public void Should_UseEnvVar_When_SetInInitialize()
    {
        // Act
        var actual = Environment.GetEnvironmentVariable("MY_VAR");

        // Assert
        actual.Should().Be("test-value");
    }
}

// BAD — try/finally in test body
[Fact]
public void Should_UseEnvVar_When_Set()
{
    var original = Environment.GetEnvironmentVariable("MY_VAR");
    try
    {
        Environment.SetEnvironmentVariable("MY_VAR", "test-value");
        var actual = Environment.GetEnvironmentVariable("MY_VAR");
        actual.Should().Be("test-value");
    }
    finally
    {
        Environment.SetEnvironmentVariable("MY_VAR", original);
    }
}
```
