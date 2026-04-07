# Dependency Injection Reference

## Anti-Patterns to Avoid

### ✗ Service Locator Pattern

Don't inject `IServiceProvider` to resolve services.

```csharp
// BAD - Service Locator anti-pattern
public class BadService
{
    private readonly IServiceProvider _serviceProvider;

    public BadService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public void DoSomething()
    {
        var repository = _serviceProvider.GetService<IXXTemplateXXRepository>();
    }
}

// GOOD - Constructor injection
public class GoodService
{
    private readonly IXXTemplateXXRepository _repository;

    public GoodService(IXXTemplateXXRepository repository)
    {
        _repository = repository;
    }
}
```

**Exception:** Only use `IServiceProvider` in factory methods or extension methods for service registration.

### ✗ New Keyword for Services

Don't instantiate services with `new`.

```csharp
// BAD
public class BadHandler
{
    public async ValueTask Handle(...)
    {
        var repository = new EfXXTemplateXXRepository(context); // DON'T
    }
}

// GOOD
public class GoodHandler
{
    private readonly IXXTemplateXXRepository _repository;

    public GoodHandler(IXXTemplateXXRepository repository)
    {
        _repository = repository;
    }
}
```

### ✗ Singleton with Scoped Dependencies

Don't inject scoped services into singleton services.

```csharp
// BAD - DbContext is scoped but injected into singleton
services.AddSingleton<BadService>(); // Singleton

public class BadService
{
    private readonly XXTemplateXXDbContext _context; // Scoped!
}

// GOOD - Use scoped service
services.AddScoped<GoodService>(); // Scoped

public class GoodService
{
    private readonly XXTemplateXXDbContext _context; // Safe
}
```

### ✗ Manual Disposal of DI-Managed Services

Don't manually dispose services managed by DI.

```csharp
// BAD
public class BadService
{
    public void DoSomething(IXXTemplateXXRepository repository)
    {
        try { /* Use repository */ }
        finally
        {
            (repository as IDisposable)?.Dispose(); // DON'T DO THIS
        }
    }
}

// GOOD - DI container manages disposal
public class GoodService
{
    private readonly IXXTemplateXXRepository _repository;
    
    // No need to dispose - DI container handles it
}
```

### ✗ Captive Dependencies

Don't capture scoped/transient dependencies in singleton services.

```csharp
// BAD - Singleton captures scoped DbContext
public class BadSingletonService
{
    private readonly XXTemplateXXDbContext _context; // Captured!
}

// GOOD - Use IServiceScopeFactory
public class GoodSingletonService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public async Task DoSomethingAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<XXTemplateXXDbContext>();
        // Use context within scope
    }
}
```

## Service Lifetime Decision Tree

```txt
Is the service stateless and lightweight?
├── Yes → Transient
└── No
    └── Does it hold per-request state (DbContext, request data)?
        ├── Yes → Scoped
        └── No
            └── Is it expensive to create or holds shared state (cache)?
                ├── Yes → Singleton
                └── No → Scoped (safe default)
```

## Lifetime Comparison Table

| Lifetime | Instance Per | Use For | Example |
| -------- | ------------ | ------- | ------- |
| Transient | Injection | Lightweight, stateless | Validators, Mappers |
| Scoped | HTTP Request | Request state, DbContext | Repositories, Unit of Work |
| Singleton | Application | Shared state, expensive | Cache, Configuration |

## Registration Checklist

1. ✓ Use constructor injection for all dependencies
2. ✓ Register interfaces, not concrete types
3. ✓ Choose appropriate lifetime (default: Scoped)
4. ✓ Group registrations in extension methods
5. ✓ Use Options pattern for configuration
6. ✓ Validate configuration with FluentValidation
7. ✓ Use IHttpClientFactory for HTTP clients
8. ✓ Avoid service locator pattern
9. ✓ Avoid captive dependencies
10. ✓ Don't manually dispose DI-managed services
