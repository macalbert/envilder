# Dependency Injection Examples

This document contains detailed code examples for .NET Dependency Injection patterns.

## Constructor Injection Examples

### Handler with Multiple Dependencies

```csharp
public class CreateGroupCommandHandler 
    : ICommandHandler<CreateGroupCommand, CreateGroupResponse>
{
    private readonly IXXTemplateXXRepository _repository;
    private readonly ILogger<CreateGroupCommandHandler> _logger;
    private readonly ISender _sender;

    public CreateGroupCommandHandler(
        IXXTemplateXXRepository repository,
        ILogger<CreateGroupCommandHandler> logger,
        ISender sender)
    {
        _repository = repository;
        _logger = logger;
        _sender = sender;
    }

    public async ValueTask<CreateGroupResponse> Handle(
        CreateGroupCommand command,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating group");
        // Use injected dependencies
    }
}
```

## Service Lifetime Examples

### Transient - Lightweight Stateless Services

```csharp
// Registration
services.AddTransient<IValidator<StripeConfig>, StripeConfigValidator>();

// Each injection creates a new instance
public class Service1
{
    private readonly IValidator<StripeConfig> _validator; // Instance A
}

public class Service2
{
    private readonly IValidator<StripeConfig> _validator; // Instance B (different)
}
```

### Scoped - Request-Scoped Services

```csharp
// Registration
services.AddScoped<IXXTemplateXXRepository, EfXXTemplateXXRepository>();
services.AddScoped<XXTemplateXXDbContext>();

// Same instance within HTTP request, different across requests
public class Handler1
{
    private readonly XXTemplateXXDbContext _context; // Instance A
}

public class Handler2 // Same request
{
    private readonly XXTemplateXXDbContext _context; // Instance A (same)
}
```

### Singleton - Application-Wide Services

```csharp
// Registration
services.AddSingleton<IDistributedCache, MemoryDistributedCache>();
services.AddSingleton<ICacheService, RedisCacheService>();

// Same instance for entire application lifetime
```

## Keyed Services Examples (.NET 8+)

### Write and Read Context Separation

```csharp
public static class XXTemplateXXDbContextExtension
{
    public const string WriteContextKey = "WriteXXTemplateXXDb";
    public const string ReadContextKey = "ReadXXTemplateXXDb";

    public static void AddXXTemplateXXDbContext(
        this IServiceCollection services, 
        string connectionString)
    {
        // Write context (with tracking)
        services.AddKeyedScoped<XXTemplateXXDbContext>(WriteContextKey, (sp, key) =>
        {
            return new(new DbContextOptionsBuilder<XXTemplateXXDbContext>()
                .UseNpgsql(connectionString).Options);
        });

        services.AddScoped<IXXTemplateXXRepository>(sp =>
        {
            var context = sp.GetRequiredKeyedService<XXTemplateXXDbContext>(WriteContextKey);
            return new EfXXTemplateXXRepository(context);
        });
    }

    public static void AddReadXXTemplateXXDbContext(
        this IServiceCollection services, 
        string connectionString)
    {
        // Read context (no tracking)
        services.AddKeyedScoped<XXTemplateXXDbContext>(ReadContextKey, (sp, key) =>
        {
            return new(new DbContextOptionsBuilder<XXTemplateXXDbContext>()
                .UseNpgsql(connectionString)
                .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking).Options);
        });

        services.AddScoped<IReadXXTemplateXXRepository>(sp =>
        {
            var context = sp.GetRequiredKeyedService<XXTemplateXXDbContext>(ReadContextKey);
            return new EfReadXXTemplateXXRepository(context);
        });
    }
}

// Usage in Program.cs
builder.Services.AddXXTemplateXXDbContext(connectionString);
builder.Services.AddReadXXTemplateXXDbContext(readConnectionString);
```

## Extension Methods for Registration

### Grouping Related Services

```csharp
namespace M47.XXTemplateXX.Infrastructure.Stripe;

public static class StripeServiceExtensions
{
    public static IServiceCollection AddStripeServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register configuration
        services.AddOptions<StripeConfig>()
            .Bind(configuration.GetSection(StripeConfig.SectionName))
            .ValidateFluently();

        services.AddSingleton<IValidator<StripeConfig>, StripeConfigValidator>();

        // Register services
        services.AddScoped<ICustomStripeClient, CustomStripeClient>();
        services.AddScoped<IStripeWebhookHandler, StripeWebhookHandler>();

        return services;
    }
}

// Usage
builder.Services.AddStripeServices(builder.Configuration);
```

## Options Pattern Examples

### Configuration Class

```csharp
namespace M47.XXTemplateXX.Domain.Configurations;

public class StripeConfig
{
    public const string SectionName = "Stripe";

    public string SecretKey { get; init; } = string.Empty;
    public string WebHookSecret { get; init; } = string.Empty;
    public SqsQueueConfig SqsQueue { get; init; } = new();
    public S3StorageConfig S3Storage { get; init; } = new();
}
```

### Registration with FluentValidation

```csharp
services.AddOptions<StripeConfig>()
    .Bind(configuration.GetSection(StripeConfig.SectionName))
    .ValidateFluently();

services.AddSingleton<IValidator<StripeConfig>, StripeConfigValidator>();
```

### IOptions Injection

```csharp
public class CustomStripeClient : ICustomStripeClient
{
    private readonly StripeConfig _config;
    private readonly ILogger<CustomStripeClient> _logger;

    public CustomStripeClient(
        IOptions<StripeConfig> config,
        ILogger<CustomStripeClient> logger)
    {
        _config = config.Value;
        _logger = logger;
    }
}
```

### IOptionsSnapshot for Hot Reload

```csharp
public class SomeService
{
    private readonly IOptionsSnapshot<StripeConfig> _config;

    public SomeService(IOptionsSnapshot<StripeConfig> config)
    {
        _config = config;
    }

    public void DoSomething()
    {
        var currentConfig = _config.Value; // Gets latest config
    }
}
```

## HttpClient Factory Examples

### Typed HttpClient Registration

```csharp
services.AddHttpClient<ILegacyApiInternal, LegacyApiInternalService>((sp, client) =>
{
    var config = sp.GetRequiredService<IOptions<LegacyApiConfig>>().Value;
    client.BaseAddress = new Uri(config.ApiServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

### Service Using Typed HttpClient

```csharp
public class LegacyApiInternalService : ILegacyApiInternal
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<LegacyApiInternalService> _logger;

    public LegacyApiInternalService(
        HttpClient httpClient, // Injected by IHttpClientFactory
        ILogger<LegacyApiInternalService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<TipsterLegacyApiResponse> GetTipsterLegacyBySlugAsync(string slug)
    {
        var response = await _httpClient.GetAsync($"/api/tipsters/{slug}");
        // ...
    }
}
```

## Minimal API Injection

```csharp
public static class GroupEndpoints
{
    public static void MapGroupEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/groups", CreateGroupAsync);
    }

    private static async Task<IResult> CreateGroupAsync(
        CreateGroupRequest request,
        ISender sender,          // Injected
        ILogger<Program> logger, // Injected
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Creating group");
        
        var command = new CreateGroupCommand(request);
        var response = await sender.Send(command, cancellationToken);
        
        return Results.Created($"/api/groups/{response.GroupId}", response);
    }
}
```

## Testing Examples

### Unit Test with NSubstitute

```csharp
public class CreateGroupCommandHandlerTests
{
    private readonly IXXTemplateXXRepository _repository;
    private readonly ILogger<CreateGroupCommandHandler> _logger;
    private readonly CreateGroupCommandHandler _sut;

    public CreateGroupCommandHandlerTests()
    {
        _repository = Substitute.For<IXXTemplateXXRepository>();
        _logger = Substitute.For<ILogger<CreateGroupCommandHandler>>();
        _sut = new CreateGroupCommandHandler(_repository, _logger);
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_CreateGroup_When_CommandIsValid()
    {
        // Arrange
        var command = new CreateGroupCommand(new CreateGroupRequest { Name = "Test" });

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        _repository.Received(1).AddGroup(Arg.Any<Group>());
    }
}
```

### Integration Test with WebApplicationFactory

```csharp
public class GroupEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public GroupEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IXXTemplateXXRepository>();
                services.AddScoped<IXXTemplateXXRepository, InMemoryXXTemplateXXRepository>();
            });
        });
        
        _client = _factory.CreateClient();
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_CreateGroup_When_RequestIsValid()
    {
        // Arrange
        var request = new CreateGroupRequest { Name = "Test Group" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/groups", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

## IServiceScopeFactory for Singletons

When singleton needs scoped dependencies:

```csharp
public class GoodSingletonService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public GoodSingletonService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task DoSomethingAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<XXTemplateXXDbContext>();
        // Use context within scope
    }
}
```
