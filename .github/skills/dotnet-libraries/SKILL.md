---
name: dotnet-libraries
description: Core backend libraries for .NET including FluentValidation, Mediator, and Entity Framework Core. Use when validating configuration/requests, creating CQRS commands/queries/handlers, implementing pipeline behaviors, or configuring database entities.
---

# Backend Libraries Skill

Core backend libraries for .NET: FluentValidation, Mediator, and Entity Framework Core.

## Code Style Rules

**NEVER write unnecessary comments or XML summaries.** Code should be self-explanatory.

| Rule | Example |
| ---- | ------ |
| Use `class` not `record` | `public class OrderResponse { ... }` |
| Always use `{}` brackets | `if (x) { return; }` never `if (x) return;` |
| Aligned wrapped parameters | Align parameters with opening parenthesis |
| Properties with `init` | `public Guid Id { get; init; }` |

## When to Use

- Validating configuration or request objects
- Creating commands, queries, and handlers (CQRS)
- Implementing pipeline behaviors (caching, logging)
- Configuring database entities with EF Core
- Writing repository implementations

## Supporting Files

| File                           | Description                              |
| ------------------------------ | ---------------------------------------- |
| [examples.md](./examples.md)   | Full code examples for all libraries     |
| [reference.md](./reference.md) | Options extension, testing, interceptors |

## 1. FluentValidation

### Common Rules

| Rule | Description |
| ---- | ----------- |
| `NotEmpty()` | Not null, empty, or whitespace |
| `NotNull()` | Not null |
| `Must(predicate)` | Custom validation logic |
| `When(condition)` | Conditional validation |
| `MaximumLength(n)` | String max length |
| `GreaterThan(value)` | Numeric comparison |
| `EmailAddress()` | Valid email format |
| `Matches(regex)` | Regex pattern |
| `RuleForEach()` | Validate collection items |
| `ChildRules()` | Validate nested objects |

### Quick Example

```csharp
public class StripeConfigValidator : AbstractValidator<StripeConfig>
{
    public StripeConfigValidator()
    {
        RuleFor(x => x.SecretKey)
            .NotEmpty()
            .Must(key => key.StartsWith("sk_"))
            .WithMessage("Must start with 'sk_'");
    }
}
```

### Registration

```csharp
services.AddSingleton<IValidator<StripeConfig>, StripeConfigValidator>();

services.AddOptions<StripeConfig>()
    .Bind(configuration.GetSection("Stripe"))
    .ValidateFluently();  // See reference.md for extension implementation
```

## 2. Mediator (CQRS)

### Request Types

| Type | Purpose | Returns |
| --------------- | ---------------- | -------- |
| `ICommand` | Write (no return) | void |
| `ICommand<T>` | Write (with return) | Response |
| `IQuery<T>` | Read | Response |
| `INotification` | Domain Events | void |

### Handler Pattern

```csharp
// Command
public class CreateOrderCommand : ICommand<Guid>
{
    public string CustomerName { get; init; }
}

// Handler
public class CreateOrderHandler : ICommandHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _repository;

    public CreateOrderHandler(IOrderRepository repository)
    {
        _repository = repository;
    }

    public async ValueTask<Guid> Handle(
        CreateOrderCommand cmd, 
        CancellationToken ct)
    {
        var order = Order.Create(Guid.CreateVersion7(), cmd.CustomerName);
        _repository.Add(order);
        await _repository.SaveChangesAsync(ct);
        return order.Id;
    }
}
```

### Using in Endpoints

```csharp
app.MapPost("/orders", async (
    CreateOrderRequest request,
    ISender sender,
    CancellationToken ct) =>
{
    var orderId = await sender.Send(new CreateOrderCommand(request.CustomerName), ct);
    return Results.Created($"/orders/{orderId}", new { orderId });
});
```

### Pipeline Behaviors

Use for cross-cutting concerns (logging, caching, validation):

```csharp
services.AddMediator(cfg => cfg.ServiceLifetime = ServiceLifetime.Scoped);
services.AddSingleton(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));
```

## 3. Entity Framework Core

### DbContext Setup

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

### Entity Configuration

```csharp
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
        builder.Ignore(x => x.DomainEvents);
    }
}
```

### Query Best Practices

| Pattern | Usage |
| ------- | ----- |
| `AsNoTracking()` | Read-only queries |
| `Select(...)` | Project only needed fields |
| `Include(...)` | Eager load relationships |

```csharp
// Read-only
var orders = await _context.Orders
    .AsNoTracking()
    .Where(o => o.Status == Status.Active)
    .ToListAsync(ct);

// Projection
var names = await _context.Orders
    .AsNoTracking()
    .Select(o => new { o.Id, o.Name })
    .ToListAsync(ct);

// Eager loading
var order = await _context.Orders
    .Include(o => o.Items)
    .FirstOrDefaultAsync(o => o.Id == id, ct);
```

## Anti-Patterns

| ✗ Don't | ✓ Do Instead |
| ------- | ------------ |
| AutoMapper | Manual mapping |
| Lazy Loading | Eager loading with `Include()` |
| Load all, filter in memory | Filter in query with `Where()` |
| Track read-only entities | Use `AsNoTracking()` |

## Related Skills

- **dotnet-architecture:** DDD and Clean Architecture patterns
- **dotnet-dependency-injection:** Service registration patterns
- **dotnet-ef-migrations:** Database migration workflow
