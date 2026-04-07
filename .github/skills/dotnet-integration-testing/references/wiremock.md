# WireMock for HTTP mocking

Mock external HTTP APIs in integration tests using WireMock.Net.

## Server fixture

```csharp
namespace M47.Shared.Tests.Infrastructure.HttpHandler;

public class WireMockServerFixture : IAsyncLifetime
{
    private WireMockServer _server;

    public async Task InitializeAsync()
    {
        _server = WireMockServer.Start();
        await Task.CompletedTask;
    }

    public void SetupGetEndpoint(string path, object response)
    {
        _server
            .Given(Request.Create()
                .WithPath(path)
                .UsingGet())
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithBodyAsJson(response));
    }

    public async Task DisposeAsync()
    {
        _server.Stop();
        await Task.CompletedTask;
    }
}
```

## Feature-specific mock server

Each Infrastructure client gets its own mock server class with setup helpers:

```csharp
public class HubSpotMockServer
{
    private readonly WireMockServer _server;
    private readonly JsonSerializerOptions _jsonOptions;

    public string Url => _server.Url!;

    public HubSpotMockServer(WireMockServer? server = null)
    {
        _server = server ?? WireMockServer.Start(Ports.GetAvailablePort());
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };
    }

    public void SetupGetClaimResponse(string claimId, string json)
    {
        _server
            .Given(Request.Create()
                .WithPath($"/crm/v3/objects/p_claims/{claimId}")
                .UsingGet())
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(json));
    }

    public async Task SetupGetClaimResponseAsync(string claimId)
    {
        var json = await SampleFile.ReadAsStringAsync<HubSpotMockServer>("HubSpotOkResponse.json");
        var original = JsonSerializer.Deserialize<HubSpotClaimResponse>(json, _jsonOptions);

        var response = JsonSerializer.Serialize(new HubSpotClaimResponse
        {
            Id = claimId,
            Properties = original!.Properties,
            Associations = original.Associations
        }, _jsonOptions);

        SetupGetClaimResponse(claimId, response);
    }
}
```

Two levels of setup:

- `SetupGetClaimResponse(id, json)` — low-level, accepts raw JSON (for inline or custom payloads)
- `SetupGetClaimResponseAsync(id)` — reads embedded sample, overrides ID (preferred for realistic tests)

See [Sample-Driven Mocking](./sample-driven-mocking.md) for the full record → embed → mock workflow.

## Rules

- One mock server per external API (e.g., `HubSpotMockServer`, `VetlandMockServer`)
- Use `Ports.GetAvailablePort()` to avoid port collisions
- Setup methods named `Setup{Verb}{Resource}Response` (sync) or `Setup{Verb}{Resource}ResponseAsync` (sample-based)
- Prefer sample-based async setup for complex responses — see [Sample-Driven Mocking](./sample-driven-mocking.md)
- Provide `SetupErrorResponse(HttpStatusCode)` for error path tests

## Recording real responses with `WithRecord`

The shared project provides `RecordWiremockHandler` — a `DelegatingHandler` that
intercepts real HTTP calls and saves the request/response as WireMock mapping files
directly to `scripts/development/wiremock/`.

Chain `.WithRecord("FileName")` on an HTTP client builder to enable recording:

```csharp
var sut = await HttpClaimProcessorBuilder.Build()
    .WithRecord("AiProcessLambda")
    .CreateAsync();
```

This produces WireMock-compatible JSON files in:

- `scripts/development/wiremock/mappings/` — request matchers + response stubs
- `scripts/development/wiremock/__files/` — response bodies (JSON or base64)

These recorded files can then be:

1. **Loaded by WireMock in Docker Compose** (`scripts/development/wiremock/`) for LocalDevelopment
2. **Copied to `Sample/` as embedded resources** for realistic test fixtures — see [Sample-Driven Mocking](./sample-driven-mocking.md)
