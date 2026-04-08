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
