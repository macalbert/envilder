# Sample-Driven Mocking Workflow

End-to-end workflow for creating realistic mock servers using recorded API responses
as embedded resource samples.

## Overview

```text
Manual test + WithRecord   →   WireMock JSON in scripts/development/wiremock/
       ↓
Copy __files/ JSON         →   test/.../Infrastructure/{Feature}/Sample/{Name}.json
       ↓
Set as EmbeddedResource    →   .csproj <EmbeddedResource Include="..." />
       ↓
MockServer reads sample    →   SampleFile.ReadAsStringAsync<TMockServer>("Name.json")
       ↓
Deserialize + override ID  →   Re-serialize with test-specific ID for congruence
       ↓
Tests use setup method     →   No inline JSON — realistic, maintainable
```

## Step-by-step

### 1. Record real response

Run the manual test (un-skip temporarily or run from IDE) — `WithRecord` saves the
real API response as WireMock JSON files:

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

Output: `scripts/development/wiremock/__files/HubSpot-get-crm-v3-objects-p-claims-49793542769.json`

### 2. Copy to Sample folder

Copy the recorded JSON from `scripts/development/wiremock/__files/` to the test
project, next to the mock server implementation:

```
test/XXTemplateXX.Tests/Infrastructure/{Feature}/
├── Http{Feature}ClientBuilder.cs
├── Http{Feature}ClientTests.cs
├── {Feature}MockServer.cs
└── Sample/
    └── {Feature}OkResponse.json       ← copied from recorded __files/
```

### 3. Add as EmbeddedResource

In the `.csproj`, register the JSON as an embedded resource:

```xml
<ItemGroup>
  <None Remove="Infrastructure\HubSpot\Sample\HubSpotOkResponse.json" />
</ItemGroup>

<ItemGroup>
  <EmbeddedResource Include="Infrastructure\HubSpot\Sample\HubSpotOkResponse.json" />
</ItemGroup>
```

### 4. MockServer reads from sample

The mock server uses `SampleFile.ReadAsStringAsync<T>` (from the shared project) to
read the embedded resource. Deserialize to the domain model, override the ID for test
congruence, and re-serialize:

```csharp
public async Task SetupGetClaimResponseAsync(string claimId)
{
    var json = await SampleFile.ReadAsStringAsync<HubSpotMockServer>("HubSpotOkResponse.json");

    var hubSpotClaimResponse = JsonSerializer.Deserialize<HubSpotClaimResponse>(json, _jsonOptions);

    var response = JsonSerializer.Serialize(new HubSpotClaimResponse
    {
        Id = claimId,
        Properties = hubSpotClaimResponse!.Properties,
        Associations = hubSpotClaimResponse.Associations
    }, _jsonOptions);

    SetupGetClaimResponse(claimId, response);
}
```

**Key points:**

- Read sample → deserialize → create new model with test-specific ID → re-serialize
- This ensures the mock returns the same structure as the real API
- Only dynamic fields (like ID) are overridden — all other fields stay realistic

### 5. Tests use the async setup

Tests call the sample-based setup — no inline JSON strings:

```csharp
[Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
public async Task Should_ReturnClaimResponse_When_HubSpotReturnsValidJson()
{
    // Arrange
    const string claimId = "49814930507";
    await _server.SetupGetClaimResponseAsync(claimId);

    // Act
    var actual = await _sut.GetClaimAsync(claimId, CancellationToken);

    // Assert
    actual.Id.Should().Be(claimId);
    actual.Properties.Type.Should().Be("VetService");
}
```

## Rules

- **One sample per response type** — `{Feature}OkResponse.json`, `{Feature}ErrorResponse.json`
- **Always EmbeddedResource** — not `Content` or `CopyToOutputDirectory`
- **SampleFile uses the MockServer type** as anchor: `SampleFile.ReadAsStringAsync<TMockServer>(...)`
- **Sample folder** lives next to the MockServer: `Infrastructure/{Feature}/Sample/`
- **Override only dynamic fields** (IDs) — keep the rest from the real response
- **Same `JsonSerializerOptions`** in mock server as in the real client (converters, naming policies)
- **Naming**: `Setup{Verb}{Resource}ResponseAsync` for sample-based methods (async because of file read)

## When to use inline JSON vs samples

| Scenario | Approach |
|----------|----------|
| Response has complex/dynamic structure (converters, associations) | **Sample file** — too brittle to maintain inline |
| Response is simple and short (< 10 lines) | **Inline JSON** still acceptable |
| Multiple tests need the same response shape | **Sample file** — single source of truth |
| Testing error responses | **Inline** or `SetupErrorResponse(HttpStatusCode)` |
