# Backend Architecture Reference

This document contains layer dependency rules, architectural diagrams, and advanced patterns.

## Layer Structure

```txt
src/
├── Domain/                     # Core business logic (no external dependencies)
│   ├── Entities/              # Aggregates, entities
│   ├── ValueObjects/          # Value objects
│   ├── DomainEvents/          # Domain events
│   ├── Services/              # Domain services
│   ├── Enums/                 # Domain enumerations
│   ├── Exceptions/            # Domain exceptions
│   └── Ports/                 # Interfaces (repository contracts)
│
├── Application/               # Use cases (depends only on Domain)
│   ├── {Entity}/
│   │   ├── Create/
│   │   │   ├── CreateEntityCommand.cs
│   │   │   ├── CreateEntityCommandHandler.cs
│   │   │   └── Models/
│   │   ├── Update/
│   │   └── Get{Something}/
│   └── Behaviors/            # Cross-cutting concerns (validation, logging)
│
└── Infrastructure/           # External concerns (depends on Application + Domain)
    ├── Persistence/          # EF Core, Dapper
    ├── ExternalServices/     # HTTP clients, message buses
    └── Configuration/        # DI, startup configuration
```

## Dependency Rules

```txt
┌─────────────────┐
│   Presentation  │  (APIs, Controllers)
│    (Web/API)    │
└─────────────────┘
         ↓ depends on
         ↓
┌─────────────────┐
│  Infrastructure │  (EF Core, HTTP Clients, External APIs)
└─────────────────┘
         ↓ depends on
         ↓
┌─────────────────┐
│   Application   │  (Use Cases, Handlers, DTOs)
└─────────────────┘
         ↓ depends on
         ↓
┌─────────────────┐
│     Domain      │  (Entities, Value Objects, Domain Services)
│  (No Dependencies)│
└─────────────────┘
```

**Key Rules:**

1. Domain has **zero** external dependencies
2. Application depends only on Domain
3. Infrastructure depends on Application and Domain
4. Presentation depends on Application and Infrastructure

## Write vs Read Repository Separation

### Why Separate?

| Aspect | Write Repository | Read Repository |
| ------ | --------------- | --------------- |
| Purpose | Transactional consistency | Query optimization |
| Tracking | Enabled | `AsNoTracking()` |
| Operations | Add, Update, Remove | Get, Find, Query |
| Caching | No | Can be cached |
| Scalability | Write master | Read replicas |

### Write Repository Interface

```csharp
public interface IWriteRepository<T> where T : AggregateRoot<Guid>
{
    void Add(T entity);
    void Update(T entity);
    void Remove(T entity);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
```

### Read Repository Interface

```csharp
public interface IReadRepository<T> where T : AggregateRoot<Guid>
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken);
}
```

## Domain Event Publishing

### Interceptor Pattern

```csharp
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
            return await base.SavedChangesAsync(eventData, result, cancellationToken);

        var aggregates = dbContext.ChangeTracker
            .Entries<IAggregateRoot>()
            .Select(e => e.Entity)
            .ToList();

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

### Registration

```csharp
services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseNpgsql(connectionString);
    options.AddInterceptors(sp.GetRequiredService<DomainEventInterceptor>());
});

services.AddScoped<DomainEventInterceptor>();
```

## Naming Conventions

### Commands

- **Format:** `{Action}{Entity}Command`
- **Examples:** `CreateOrderCommand`, `UpdatePriceCommand`, `CancelSubscriptionCommand`
- **Location:** `Application/{Entity}/{Action}/`

### Queries

- **Format:** `Get{Entity}By{Criteria}Query`
- **Examples:** `GetOrderByIdQuery`, `GetCustomerOrdersQuery`
- **Location:** `Application/{Entity}/Get{Something}/`

### Domain Events

- **Format:** `{Entity}{Action}DomainEvent` (past tense)
- **Examples:** `OrderCreatedDomainEvent`, `OrderShippedDomainEvent`
- **Location:** `Domain/DomainEvents/`

### Handlers

- **Format:** `{Command|Query}Handler`
- **Examples:** `CreateOrderCommandHandler`, `GetOrderByIdQueryHandler`
- **Location:** Same folder as the command/query

## Implementation Checklist

1. ✓ Define domain entities as aggregate roots
2. ✓ Implement factory methods for entity creation
3. ✓ Define port interfaces in Domain layer
4. ✓ Create commands and queries in Application layer
5. ✓ Implement handlers with validation and logging
6. ✓ Create adapters in Infrastructure layer
7. ✓ Wire up endpoints in Presentation layer
8. ✓ Write tests for domain logic, handlers, and endpoints
