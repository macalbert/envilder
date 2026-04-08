# Backend Libraries Reference

This document contains additional implementation details and extended examples for the backend libraries.

## FluentValidation Options Extension

Custom extension method for validating options with FluentValidation:

```csharp
namespace M47.Shared.Extensions;

using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

public static class OptionsBuilderFluentValidationExtensions
{
    public static OptionsBuilder<TOptions> ValidateFluently<TOptions>(
        this OptionsBuilder<TOptions> optionsBuilder) 
        where TOptions : class
    {
        optionsBuilder.Services.AddSingleton<IValidateOptions<TOptions>>(
            s => new FluentValidationOptions<TOptions>(
                optionsBuilder.Name, 
                s.GetRequiredService<IValidator<TOptions>>()));
        return optionsBuilder;
    }
}

public class FluentValidationOptions<TOptions> : IValidateOptions<TOptions> 
    where TOptions : class
{
    public string? Name { get; init; }
    private readonly IValidator<TOptions> _validator;

    public FluentValidationOptions(string? name, IValidator<TOptions> validator)
    {
        Name = name;
        _validator = validator;
    }

    public ValidateOptionsResult Validate(string? name, TOptions options)
    {
        if (string.IsNullOrWhiteSpace(name) == false && Name != name)
        {
            return ValidateOptionsResult.Skip;
        }

        ArgumentNullException.ThrowIfNull(options);

        var validatorResult = _validator.Validate(options);

        if (validatorResult.IsValid)
        {
            return ValidateOptionsResult.Success;
        }

        var errors = validatorResult.Errors.Select(x =>
            $"Options validation failed for '{x.PropertyName}' with error: '{x.ErrorMessage}'.");

        return ValidateOptionsResult.Fail(errors);
    }
}
```

## FluentValidation Testing

Use `TestValidateAsync` for unit testing validators.

**Test Example:**

```csharp
namespace M47.XXTemplateXX.Tests.Domain.Configurations.Validations;

using FluentValidation.TestHelper;

public class LegacyApiConfigValidatorTests
{
    private readonly LegacyApiConfigValidator _sut;

    public LegacyApiConfigValidatorTests()
    {
        _sut = new();
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_NotHaveValidationErrors_When_AllPropertiesSet()
    {
        // Arrange
        var config = new LegacyApiConfig
        {
            ApiBackofficeUrl = "https://api-backoffice.example.com",
            ApiServiceUrl = "https://api-service.example.com",
            Username = "username",
            Password = "password"
        };

        // Act
        var actual = await _sut.TestValidateAsync(config);

        // Assert
        actual.ShouldNotHaveValidationErrors();
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)] 
    public async Task Should_HaveValidationError_When_ApiBackofficeUrlIsEmpty()
    {
        // Arrange
        var config = new LegacyApiConfig
        {
            ApiBackofficeUrl = string.Empty,
            ApiServiceUrl = "https://api-service.example.com",
            Username = "username",
            Password = "password"
        };

        // Act
        var actual = await _sut.TestValidateAsync(config);

        // Assert
        actual.ShouldHaveValidationErrorFor(c => c.ApiBackofficeUrl);
    }
}
```

## Global Validation Error Handling

Use middleware to catch `ValidationException` and return proper HTTP responses.

**Middleware Example:**

```csharp
namespace M47.Shared.Middleware;

using FluentValidation;
using Microsoft.AspNetCore.Http;
using System.Net;

public class UnhandledExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UnhandledExceptionMiddleware> _logger;

    public UnhandledExceptionMiddleware(RequestDelegate next, ILogger<UnhandledExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogError(ex, "Validation error: {error}", ex.Message);
            await ResponseAsBadRequestAsync(context, ex);
        }
        // ... other exception handlers
    }

    private static async Task ResponseAsBadRequestAsync(HttpContext context, ValidationException ex)
    {
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

        var validationFailureResponse = new ValidationFailureResponse
        {
            Errors = ex.Errors.Select(x => new ValidationResponse
            {
                PropertyName = x.PropertyName,
                Message = x.ErrorMessage,
            })
        };

        await context.Response.WriteAsJsonAsync(validationFailureResponse);
    }
}
```

## Entity Framework Core Details

### Repository Implementation

**Example:**

```csharp
namespace M47.XXTemplateXX.Infrastructure.EntityFramework;

using M47.XXTemplateXX.Domain;
using M47.XXTemplateXX.Domain.Ports;
using Microsoft.EntityFrameworkCore;

public class XXTemplateXXRepository 
    : IXXTemplateXXRepository, IReadXXTemplateXXRepository
{
    private readonly XXTemplateXXDbContext _context;

    public XXTemplateXXRepository(XXTemplateXXDbContext context)
    {
        _context = context;
    }

    // Write operations
    public void AddGroup(Group group)
    {
        _context.Groups.Add(group);
    }

    public void UpdateGroup(Group group)
    {
        _context.Groups.Update(group);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Read operations
    public async Task<Group?> GetGroupByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Groups
            .AsNoTracking() // Use for read-only queries
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Group>> GetGroupsByTipsterIdAsync(
        string tipsterId, 
        CancellationToken cancellationToken)
    {
        return await _context.Groups
            .AsNoTracking()
            .Where(g => g.TipsterId == tipsterId)
            .ToListAsync(cancellationToken);
    }
}
```

### Domain Event Publishing

Use interceptor to automatically publish domain events after `SaveChangesAsync`.

**Interceptor:**

```csharp
namespace M47.Shared.Infrastructure.Database.EntityFramework;

using M47.Shared.Domain.Aggregate;
using M47.Shared.Domain.Bus.Event;
using Mediator;
using Microsoft.EntityFrameworkCore.Diagnostics;

public class DomainEventInterceptor : SaveChangesInterceptor
{
    private readonly IPublisher _publisher;

    public DomainEventInterceptor(IPublisher publisher)
    {
        _publisher = publisher;
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        var dbContext = eventData.Context;
        if (dbContext is null)
        {
            return await base.SavedChangesAsync(eventData, result, cancellationToken);
        }

        // Get all aggregates with domain events
        var aggregates = dbContext.ChangeTracker
            .Entries<IAggregateRoot>()
            .Select(e => e.Entity)
            .ToList();

        // Pull and publish events
        foreach (var aggregate in aggregates)
        {
            var events = aggregate.PullDomainEvents();
            foreach (var domainEvent in events)
            {
                await _publisher.Publish(domainEvent, cancellationToken);
            }
        }

        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }
}
```

**Registration:**

```csharp
services.AddDbContext<XXTemplateXXDbContext>((sp, options) =>
{
    options.UseNpgsql(connectionString);
    options.AddInterceptors(sp.GetRequiredService<DomainEventInterceptor>());
});

services.AddScoped<DomainEventInterceptor>();
```

## Query Optimization Examples

### N+1 Query Problem

**Bad - N+1 query problem:**

```csharp
var group = await _context.Groups.FindAsync(id);
var prices = await _context.Prices.Where(p => p.GroupId == id).ToListAsync();
```

**Good - Eager load related data in one query:**

```csharp
var group = await _context.Groups
    .Include(g => g.Prices)
    .Include(g => g.Coupons)
    .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
```

### Loading Entire Entity When Only Name Is Needed

**Bad - Loading entire entity when only name is needed:**

```csharp
var groups = await _context.Groups
    .AsNoTracking()
    .Where(g => g.TipsterId == tipsterId)
    .ToListAsync(cancellationToken);
var groupNames = groups.Select(g => g.Name);
```

**Good - Select only needed fields:**

```csharp
var groupNames = await _context.Groups
    .AsNoTracking()
    .Where(g => g.TipsterId == tipsterId)
    .Select(g => new { g.Id, g.Name })
    .ToListAsync(cancellationToken);
```

### Tracking Overhead For Read-Only Operation

**Bad - Tracking overhead for read-only operation:**

```csharp
var groups = await _context.Groups
    .Where(g => g.TipsterId == tipsterId)
    .ToListAsync(cancellationToken);
```

**Good - Read-only query:**

```csharp
var groups = await _context.Groups
    .AsNoTracking()
    .Where(g => g.TipsterId == tipsterId)
    .ToListAsync(cancellationToken);
```
