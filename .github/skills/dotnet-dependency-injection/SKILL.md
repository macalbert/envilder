---
name: dotnet-dependency-injection
description: Dependency Injection best practices for .NET including constructor injection, service lifetimes, keyed services, and Options pattern. Use when setting up DI container in Program.cs, registering services with appropriate lifetimes, or configuring Options pattern.
---

# Dependency Injection Skill

Dependency Injection best practices for .NET including constructor injection, service lifetimes,
keyed services, and Options pattern.

| Rule                     | Example                             |
| ------------------------ | ----------------------------------- |
| Use `class` not `record` | `public class StripeConfig { ... }` |

**NEVER write unnecessary comments or XML summaries.** Code should be self-explanatory.

| Rule | Example |
| ---- | ------- |
| Use `class` not `record` | `public class StripeConfig { ... }` |
| Always use `{}` brackets | `if (x) { return; }` never `if (x) return;` |
| Aligned wrapped parameters | Align parameters with opening parenthesis |
| Properties with `init` | `public string ApiKey { get; init; }` |

## When to Use

- Setting up DI container in Program.cs
- Registering services with appropriate lifetimes
- Configuring Options pattern for configuration
- Using keyed services for multiple implementations
- Creating typed HttpClients

## Supporting Files

| File                                                               | Description                                |
| ------------------------------------------------------------------ | ------------------------------------------ |
| [examples.md](./examples.md)                                       | Full code examples for all DI patterns     |
| [reference.md](./reference.md)                                     | Anti-patterns, lifetime tree, checklist    |
| [templates/service-extension.cs](./templates/service-extension.cs) | Service registration extension template    |

## Core Principles

### 1. Constructor Injection (Always)

Use constructor injection for all required dependencies:

```csharp
public class OrderHandler : ICommandHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _repository;
    private readonly ILogger<OrderHandler> _logger;

    public OrderHandler(
        IOrderRepository repository,
        ILogger<OrderHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }
}
```

### 2. Service Lifetimes

| Lifetime | When to Use | Example |
| -------- | ----------- | ------- |
| **Transient** | Lightweight, stateless services | Validators, Mappers |
| **Scoped** | Request-scoped, state per request | Repositories, DbContext |
| **Singleton** | Shared state, expensive creation | Cache, Configuration |

```csharp
services.AddTransient<IValidator<Config>, ConfigValidator>();
services.AddScoped<IOrderRepository, OrderRepository>();
services.AddSingleton<ICacheService, RedisCacheService>();
```

### 3. Interface-Based Registration

Always register interfaces, not concrete types:

```csharp
// ✓ Good
services.AddScoped<IOrderRepository, EfOrderRepository>();

// ✗ Bad
services.AddScoped<EfOrderRepository>();
```

### 4. Extension Methods for Grouping

Group related service registrations:

```csharp
public static class StripeServiceExtensions
{
    public static IServiceCollection AddStripeServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<StripeConfig>()
            .Bind(configuration.GetSection("Stripe"))
            .ValidateFluently();

        services.AddScoped<IStripeClient, StripeClient>();
        return services;
    }
}

// Usage: builder.Services.AddStripeServices(builder.Configuration);
```

### 5. Options Pattern

Use for typed configuration:

```csharp
// Configuration class
public class StripeConfig
{
    public const string SectionName = "Stripe";
    public string SecretKey { get; init; } = string.Empty;
}

// Registration
services.AddOptions<StripeConfig>()
    .Bind(configuration.GetSection(StripeConfig.SectionName))
    .ValidateFluently();

// Injection
public class StripeClient(IOptions<StripeConfig> config)
{
    private readonly StripeConfig _config = config.Value;
}
```

### 6. HttpClient Factory

Always use IHttpClientFactory for HTTP clients:

```csharp
services.AddHttpClient<IApiClient, ApiClient>((sp, client) =>
{
    var config = sp.GetRequiredService<IOptions<ApiConfig>>().Value;
    client.BaseAddress = new Uri(config.ApiUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

### 7. Keyed Services (.NET 8+)

For multiple implementations of same interface:

```csharp
services.AddKeyedScoped<IDbContext>("Write", (sp, key) =>
    new DbContext(writeConnectionString));

services.AddKeyedScoped<IDbContext>("Read", (sp, key) =>
    new DbContext(readConnectionString, QueryTrackingBehavior.NoTracking));

// Resolution
var writeContext = sp.GetRequiredKeyedService<IDbContext>("Write");
```

## Quick Rules

1. **Constructor injection** - Always use for required dependencies
2. **Scoped by default** - Safe choice when uncertain about lifetime
3. **No service locator** - Don't inject `IServiceProvider` except in factories
4. **No `new` for services** - Let DI container manage instantiation
5. **No manual disposal** - DI container handles `IDisposable`
6. **No captive dependencies** - Don't inject scoped into singleton

## Related Skills

- **dotnet-architecture:** Clean Architecture layer structure
- **dotnet-libraries:** FluentValidation for Options validation
