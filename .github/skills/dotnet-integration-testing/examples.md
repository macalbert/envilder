# Integration Testing — Real Examples

Examples extracted from the codebase to illustrate patterns described in SKILL.md.

## Shared Base Classes

### LocalStackWebBaseServicesFactory

The base class for all API acceptance tests. Provides LocalStack, WireMock, and
service resolution.

```csharp
// shared/test/Backend/TestContainers/LocalStackWebBaseServicesFactory.cs

public abstract class LocalStackWebBaseServicesFactory<TEntryPoint>
    : WebApplicationFactory<TEntryPoint>, IAsyncLifetime where TEntryPoint : class
{
    private IServiceScope? _scope;
    protected readonly WireMockServer WireMockServer;
    public LocalstackContainerBuilder<TEntryPoint> Localstack { get; }

    public LocalStackWebBaseServicesFactory(string group)
    {
        Randomizer.Seed = new Random(666);
        Localstack = new(group);
        WireMockServer = WireMockServer.Start(Ports.GetAvailablePort());
    }

    public T GetRequiredService<T>() where T : class =>
        CurrentScope.ServiceProvider.GetRequiredService<T>();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureLogging(logging =>
        {
            logging.ClearProviders();
            logging.Services.AddLogging(config => config.AddConsole());
            logging.SetMinimumLevel(LogLevel.Warning);
        });

        builder.ConfigureTestServices((services) =>
        {
            services.RemoveAll(typeof(IHostedService));
        });
    }

    public async Task InitializeAsync()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
        await Localstack.Container.StartAsync(cts.Token).ConfigureAwait(false);
        await OtherInitializeAsync(cts.Token);
    }

    protected virtual Task OtherInitializeAsync(CancellationToken cancellationToken)
        => Task.CompletedTask;
}
```

## ApiServicesFactory (Project-Specific)

```csharp
// xxtemplatexx/test/apps/Minimal.Api.Tests.Acceptance/Factories/ApiServicesFactory.cs

public class ApiServicesFactory : LocalStackWebBaseServicesFactory<IMinimalApiMarker>
{
    private readonly PostgreSqlContainer _dbContainer;

    public ApiServicesFactory() : base("xxtemplatexx-api")
    {
        _dbContainer = new PostgreSqlContainerBuilder("xxtemplatexx-api").Container;
    }

    public HttpClient CreateClientWithApiKey()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(AuthConstants.ApiKeyHeaderName, "API_KEY");
        return client;
    }

    public async Task PurgeSystemAsync()
    {
        var config = GetRequiredService<IOptions<MessageBrokerProcessesConfig>>().Value;
        await Localstack.AwsHelper.PurgeQueueAsync(config.QueueUrl);

        var dbContext = GetRequiredKeyedService<XXTemplateXXDbContext>(
            XXTemplateXXDbContextExtension.DefaultContextKey);
        dbContext.Processes.RemoveRange(dbContext.Processes);
        await dbContext.PurgeSystemAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);

        builder.ConfigureTestServices(services =>
        {
            services.AwsRedirectToLocalStack(Localstack.Credentials, Localstack.Uri);

            var connectionString = _dbContainer.GetConnectionString();
            services.RemoveKeyedService<DbContextOptions<XXTemplateXXDbContext>>(
                XXTemplateXXDbContextExtension.DefaultContextKey);
            services.AddDbContextWithDomainEvents(connectionString);
        });
    }

    protected override async Task OtherInitializeAsync(CancellationToken cancellationToken)
    {
        await _dbContainer.StartAsync(cancellationToken).ConfigureAwait(false);

        var dbContext = GetRequiredKeyedService<XXTemplateXXDbContext>(
            XXTemplateXXDbContextExtension.DefaultContextKey);
        dbContext.Database.Migrate();
    }
}
```

## Acceptance Test Using Factory

```csharp
// Endpoints/Health/GetHealthEndpointTests.cs

[Collection(nameof(ApiServicesFactoryShared))]
public class GetHealthEndpointTests : IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly ApiServicesFactory _factory;
    private CancellationToken CancellationToken => CancellationTokenForTest.CreateDefault;

    public GetHealthEndpointTests(ApiServicesFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public Task InitializeAsync() => Task.CompletedTask;
    public async Task DisposeAsync() => await _factory.PurgeSystemAsync();

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_ReturnHealthy_When_AllDependenciesAreAccessible()
    {
        // Arrange
        var endpoint = ApiEndpoints.Health;

        // Act
        var response = await _client.GetAsync(endpoint, CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync(CancellationToken);
        var healthResult = JsonSerializer.Deserialize<HealthResponse>(content, _cachedJsonOptions);

        healthResult.Should().NotBeNull();
        healthResult!.Status.Should().Be("Healthy");
        healthResult.Dependencies.Should().NotBeEmpty();
        healthResult.Dependencies.Should().Contain(d => d.Dependency == "Database");
        healthResult.Dependencies.Should().Contain(d => d.Dependency == "S3 Bucket");
        healthResult.Dependencies.Should().Contain(d => d.Dependency == "SQS Queue");
        healthResult.Dependencies.Should().OnlyContain(d => d.Status == "Healthy");
    }
}
```

## Unit-Level Integration Tests (NSubstitute)

```csharp
// Infrastructure/Integration/SqsConsumerBrokerMessageTests.cs

public class SqsConsumerBrokerMessageTests
{
    private readonly SqsConsumerBrokerMessage _client;
    private readonly Fixture _fixture;
    private readonly IQueue<ProcessCreatedDomainEvent> _queue;
    private CancellationToken CancellationToken => CancellationTokenForTest.CreateDefault;

    public SqsConsumerBrokerMessageTests()
    {
        _fixture = new();
        _queue = Substitute.For<IQueue<ProcessCreatedDomainEvent>>();
        var options = Options.Create(new MessageBrokerProcessesConfig
        {
            QueueUrl = "someId",
            DelayInSeconds = 0,
        });

        _client = new SqsConsumerBrokerMessage(_queue, options);
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_ReturnMessageOnPull_When_MessageIsAvailable()
    {
        // Arrange
        var expected = _fixture.Create<Dictionary<string, ProcessCreatedDomainEvent>>();
        _queue.PullMessagesAsync(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<int>(),
                                 Arg.Any<CancellationToken>())
              .Returns(expected);

        // Act
        var actual = await _client.PullMessageAsync(CancellationToken);

        // Assert
        actual.Should().BeEquivalentTo(expected);
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_ThrowCancellationToken_When_QueueIsEmptyAndExceedsTimeout()
    {
        // Arrange
        _queue.PullMessagesAsync(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<int>(),
                                 Arg.Any<CancellationToken>())
              .ThrowsAsync<OperationCanceledException>();
        var token = CancellationTokenForTest.CancelAfter(seconds: 1);

        // Act
        var action = () => _client.PullMessageAsync(token);

        // Assert
        await action.Should().ThrowAsync<OperationCanceledException>();
    }
}
```

## Mother Objects for Test Data

```csharp
// Domain/Mothers/ProcessMother.cs

public sealed class ProcessMother
{
    public static Process Create(Guid? id = null,
                                 Guid? claimId = null,
                                 ProcessStatus? status = null,
                                 int? progress = null)
        => new ProcessMother().CreateWith(id, claimId, status, progress);

    public static IEnumerable<Process> CreateMany(
        ProcessStatus? status = null, int count = 10)
        => new ProcessMother().GenerateProcess(status: status, count: count).ToArray();

    private readonly Faker _faker;

    public ProcessMother(int randomizer = 666)
    {
        _faker = new() { Random = new Randomizer(randomizer) };
    }

    public Process CreateWith(Guid? id = null,
                              Guid? claimId = null,
                              ProcessStatus? status = null,
                              int? progress = null)
    {
        status ??= _faker.PickRandom<ProcessStatus>();
        progress ??= status == ProcessStatus.Done ? 100 : _faker.Random.Number(0, 100);

        return Process.Create(
            id: id ?? _faker.Random.Guid(),
            claimId: claimId ?? _faker.Random.Guid(),
            status: (ProcessStatus)status,
            progress: progress.Value);
    }
}
```

## CI Workflow

```yaml
# .github/workflows/test-backend.yml (key pattern)
strategy:
  matrix:
    environment: [unit, api-acceptance, ws-acceptance]
    include:
      - environment: unit
        project: xxtemplatexx/test/XXTemplateXX.Tests/XXTemplateXX.Tests.csproj
      - environment: api-acceptance
        project: xxtemplatexx/test/apps/Minimal.Api.Tests.Acceptance/Minimal.Api.Tests.Acceptance.csproj
      - environment: ws-acceptance
        project: xxtemplatexx/test/apps/WorkerService.Tests.Acceptance/WorkerService.Tests.Acceptance.csproj

steps:
  - name: 🏎️ Run Tests
    run: |
      dotnet test ${{matrix.project}} --no-build --configuration Release \
        --logger "trx;LogFileName=test-results-${{matrix.environment}}.trx"
    env:
      TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: /var/run/docker.sock
      DOCKER_HOST: unix:///var/run/docker.sock
```

## Test Infrastructure Map

| Component | Location |
| --------- | -------- |
| Base WebApplicationFactory | `shared/test/Backend/TestContainers/LocalStackWebBaseServicesFactory.cs` |
| Host-based factory | `shared/test/Backend/TestContainers/LocalStackHostBaseServicesFactory.cs` |
| PostgreSQL builder | `shared/test/Backend/TestContainers/Containers/PostgreSql/` |
| LocalStack builder | `shared/test/Backend/TestContainers/Containers/Localstack/` |
| AutoFixture extensions | `shared/test/Backend/Extensions/FixtureExtensions.cs` |
| CancellationToken helpers | `shared/test/Backend/Utils/CancellationToken/` |
| Mother objects | `xxtemplatexx/test/XXTemplateXX.Tests/Domain/Mothers/` |
| API Factory | `xxtemplatexx/test/apps/Minimal.Api.Tests.Acceptance/Factories/ApiServicesFactory.cs` |
