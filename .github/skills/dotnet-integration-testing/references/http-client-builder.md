# HTTP Client Builder Pattern

Three-part pattern for Infrastructure HTTP adapters: extension registers the
`HttpClient` via DI, test builder reuses the same registration, manual tests
record real responses.

## 1. Extension in Infrastructure (source of truth)

Two overloads — one reads from `IConfiguration`, one accepts raw values (reused by
test builders). The `HttpClient` is always configured inside `AddHttpClient`.

```csharp
namespace M47.XXTemplateXX.Infrastructure.HubSpot;

public static class HttpHubSpotClientExtension
{
    public static void AddHubSpotClient(this IServiceCollection services, IConfiguration configuration)
    {
        var config = configuration.GetSection(HubSpotConfig.SectionName);
        services.Configure<HubSpotConfig>(config);

        var hubSpotConfig = config.Get<HubSpotConfig>()!;
        services.AddHubSpotClient(hubSpotConfig.ApiUrl, hubSpotConfig.AccessToken);
    }

    public static void AddHubSpotClient(this IServiceCollection services, string baseUrl, string accessToken)
    {
        services.AddHttpClient<IHubSpotClient, HttpHubSpotClient>((sp, client) =>
        {
            client.BaseAddress = new(baseUrl);
            client.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);
            client.DefaultRequestHeaders.Accept.Add(new(MediaTypeNames.Application.Json));
        });
    }
}
```

**Rules:**

- Class name: `Http{Feature}ClientExtension`
- File: `Infrastructure/{Feature}/`
- First overload: `IConfiguration` → `services.Configure<T>()` + calls second overload
- Second overload: raw values → `services.AddHttpClient<IInterface, Implementation>()`
- Target-typed `new()` for headers (e.g., `new("Bearer", token)`)

## 2. Infrastructure client (error logging)

Every `async` method wraps the HTTP call in try/catch, logs the error with
`StatusCode`, and rethrows:

```csharp
public async Task<HubSpotClaimResponse> GetClaimAsync(string claimId, CancellationToken cancellationToken = default)
{
    _logger.LogInformation("Getting claim {ClaimId} from HubSpot", claimId);

    try
    {
        var response = await _httpClient.GetAsync(
            $"/crm/v3/objects/p_claims/{claimId}?properties=url1,url2,type&associations=p_insureds",
            cancellationToken);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<HubSpotClaimResponse>(_jsonOptions, cancellationToken);
        return result!;
    }
    catch (HttpRequestException ex)
    {
        _logger.LogError(ex, "Failed to get claim {ClaimId} from HubSpot. StatusCode: {StatusCode}", claimId, ex.StatusCode);
        throw;
    }
}
```

**Rules:**

- `LogInformation` before the call, `LogError` in the catch
- Always `throw;` — never swallow exceptions
- Log `ex.StatusCode` for HTTP diagnostics
- Use structured logging (`{Param}`, not interpolation)

## 3. Test Builder (with SSM + WithRecord)

Static `Build()` factory + nested builder class with three capabilities:

- `CreateAsync()` — builds a `ServiceCollection`, calls the extension's second overload, resolves via DI
- `CreateMock(server)` — uses mock server's `HttpClient`
- `WithRecord(outputFile)` — records real request/response to `scripts/development/wiremock/`

```csharp
public class HttpHubSpotClientBuilder
{
    private const string _appName = "Minimal.Api";

    private static readonly string _path = Path.Combine(
        Directory.GetCurrentDirectory().Split(@"xxtemplatexx\test").First(),
        RecordWiremockHandler.PathWiremock);

    public static HubSpotClientBuilder Build() => new(_path);

    private static T GetFromAppSettings<T>(string sectionName) { /* ... */ }

    public class HubSpotClientBuilder
    {
        private readonly string _path;
        private DelegatingHandler? _handler;

        public HubSpotClientBuilder(string path) { _path = path; }

        public async Task<HttpHubSpotClient> CreateAsync()
        {
            var config = GetFromAppSettings<HubSpotConfig>(HubSpotConfig.SectionName);

            var namespaceName = typeof(IXXTemplateXXMarker).Namespace;
            var accessToken = await ParameterStore.GetValueFromParameterStoreAsync(
                $"{HubSpotConfig.SectionName}/{nameof(HubSpotConfig.AccessToken)}",
                @namespace: $"{namespaceName}.Apps.{_appName}",
                withDecryption: true);

            var services = new ServiceCollection();
            services.AddLogging();
            services.AddHubSpotClient(config.ApiUrl, accessToken);

            if (_handler is not null)
            {
                services.ConfigureHttpClientDefaults(builder =>
                    builder.AddHttpMessageHandler(() => _handler));
            }

            var provider = services.BuildServiceProvider();

            return (HttpHubSpotClient)provider.GetRequiredService<IHubSpotClient>();
        }

        public HttpHubSpotClient CreateMock(HubSpotMockServer server)
        {
            return new(server.HttpClient, Substitute.For<ILogger<HttpHubSpotClient>>());
        }

        public HubSpotClientBuilder WithRecord(string outputFile)
        {
            _handler = new RecordWiremockHandler(_path, outputFile);
            return this;
        }
    }
}
```

**Key difference from mock:** `CreateAsync()` uses a real `ServiceCollection` +
`BuildServiceProvider()` to resolve the client the same way production does —
including `ILogger` via `AddLogging()`.

**SSM path:** `/{namespace}.Apps.{appName}/{environment}/{SectionName}/{PropertyName}`

**Rules:**

- Class name: `Http{Feature}ClientBuilder`
- File: `test/XXTemplateXX.Tests/Infrastructure/{Feature}/`
- `CreateAsync()` calls `services.Add{Feature}Client(url, token)` — same extension as production
- `WithRecord` uses `ConfigureHttpClientDefaults` to inject the `RecordWiremockHandler`
- `CreateMock` bypasses DI — directly constructs with mock server's `HttpClient`

## 4. Manual real-client test (with recording)

Every HTTP client test class **must include a skipped happy-path test** that hits the real API
**and records** the request/response for later use as WireMock stubs.

```csharp
[Fact(Skip = "Manual test")]
public async Task Should_ReturnClaimResponse_When_HubSpotReturnsValidJsonInRealClient()
{
    // Arrange
    var sut = await HttpHubSpotClientBuilder.Build()
        .WithRecord("HubSpot")
        .CreateAsync();

    // Act
    var actual = await sut.GetClaimAsync("49793542769", CancellationToken.None);

    // Assert
    actual.Should().NotBeNull();
}
```

Recorded files land in `scripts/development/wiremock/` (mappings + __files) and can be
loaded directly by WireMock in Docker Compose for the LocalDevelopment environment.

**Rules:**

- Always `[Fact(Skip = "Manual test")]` — never runs in CI
- Name: `Should_{Behavior}_When_{Condition}InRealClient`
- Uses `Build().WithRecord("FeatureName").CreateAsync()` — records + no hardcoded secrets
- Requires AWS CLI configured with the right profile
- Minimal assertions (`NotBeNull`) — verifies connectivity only
- One per test class, covering the main happy path
