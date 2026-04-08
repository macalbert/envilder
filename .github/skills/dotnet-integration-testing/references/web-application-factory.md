# WebApplicationFactory

Test API endpoints with the real ASP.NET pipeline using `WebApplicationFactory<Program>`.

## Basic usage

```csharp
public class ApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IXXTemplateXXRepository>();
                services.AddScoped<IXXTemplateXXRepository, InMemoryRepository>();
            });
        }).CreateClient();
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_ReturnOk_When_GetGroups()
    {
        // Act
        var response = await _client.GetAsync("/api/groups");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
```

## Custom factory with containers

For tests needing real databases or LocalStack, extend `LocalStackWebBaseServicesFactory`:

```csharp
public sealed class MyFeatureFactory : LocalStackWebBaseServicesFactory<IMinimalApiMarker>
{
    public MyFeatureFactory() : base("my-feature") { }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureTestServices(services =>
        {
            // Override specific services
        });
    }
}
```

See [examples.md](../examples.md) for the full `LocalStackWebBaseServicesFactory` pattern.

## Rules

- Use `IClassFixture<T>` for shared factory across tests in a class
- Override services in `ConfigureTestServices` — not `ConfigureServices`
- Remove all `IHostedService` registrations to avoid background work during tests
- Use `RemoveAll<T>()` before re-registering to avoid duplicate registrations
