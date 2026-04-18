---
name: dotnet-architecture
description: Domain-Driven Design, CQRS, and Clean Architecture patterns for .NET backends. Use when implementing backend features using DDD patterns, creating commands/queries, designing aggregate roots and value objects, or working with Clean Architecture layer separation.
---

# Backend Architecture Skill

Domain-Driven Design, CQRS, and Clean Architecture patterns for .NET backends.

## Code Style Rules

**NEVER write unnecessary comments or XML summaries.** Code should be self-explanatory.
Exception: **SDK public APIs** (`src/sdks/*`) MUST keep XML doc summaries and `<param>` tags on
public classes and methods — consumers rely on IDE tooltips and IntelliSense.

| Rule | Example |
| ---- | ------ |
| Use `class` not `record` | `public class OrderCreated : DomainEvent` |
| Always use `{}` brackets | `if (x) { return; }` never `if (x) return;` |
| Aligned wrapped parameters | Align parameters with opening parenthesis |
| Private constructors at end | After all public/protected members |
| Pragma for EF constructors | `#pragma warning disable CS8618` |

## When to Use

- Implementing backend features using DDD patterns
- Creating commands and queries with Mediator
- Designing aggregate roots and value objects
- Working with Clean Architecture layer separation
- Integrating with Entity Framework Core

## Supporting Files

| File | Description |
| ---- | ----------- |
| [examples.md](./examples.md) | Full code examples for all patterns |
| [reference.md](./reference.md) | Layer rules, dependency diagrams, conventions |
| [templates/aggregate-root.cs](./templates/aggregate-root.cs) | Aggregate root template |
| [templates/domain-event.cs](./templates/domain-event.cs) | Domain event templates |

## Core Principles

### Clean Architecture Layers

```txt
Presentation → Infrastructure → Application → Domain
```

**Domain Layer (Core):**

- Contains entities, value objects, domain events, domain services
- Zero external dependencies
- Business rules and invariants live here

**Application Layer:**

- Contains commands, queries, and handlers
- Orchestrates domain objects
- Depends only on Domain layer

**Infrastructure Layer:**

- Contains EF Core, HTTP clients, external services
- Implements domain ports (interfaces)
- Depends on Application and Domain

**Presentation Layer:**

- Contains API endpoints, controllers
- Maps HTTP requests to commands/queries
- Depends on Application and Infrastructure

### CQRS Separation

- **Commands:** Modify state, return minimal data
- **Queries:** Read state, return DTOs
- **Separate concerns:** Write models vs Read models

### Key Rules

1. **Domain is pure:** No framework dependencies
2. **Aggregate roots guard invariants:** All mutations through domain methods
3. **Factory methods for creation:** Use `static Create()` not public constructors
4. **Private setters:** Prevent external state mutation
5. **Domain events for side effects:** Decouple cross-cutting concerns
6. **Ports and adapters:** Domain defines interfaces, Infrastructure implements

## Quick Start

### 1. Create Aggregate Root

Use `templates/aggregate-root.cs` as starting point:

```csharp
public sealed class Order : AggregateRoot<Guid>
{
    public override Guid Id { get; protected init; }
    public string CustomerName { get; private set; } = string.Empty;
    
    public static Order Create(Guid id, string customerName)
    {
        var order = new Order { Id = id, CustomerName = customerName };
        order.Record(new OrderCreatedDomainEvent { OrderId = id });
        return order;
    }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    private Order()
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    {
    }
}
```

### 2. Create Command + Handler

```csharp
public class CreateOrderCommand : ICommand<Guid>
{
    public string CustomerName { get; init; } = string.Empty;
}

public class CreateOrderCommandHandler : ICommandHandler<CreateOrderCommand, Guid>
{
    public async ValueTask<Guid> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(Guid.CreateVersion7(), cmd.CustomerName);
        _repository.Add(order);
        await _repository.SaveChangesAsync(ct);
        return order.Id;
    }
}
```

### 3. Define Repository Port (Domain)

```csharp
namespace Domain.Ports;

public interface IOrderRepository
{
    void Add(Order order);
    Task SaveChangesAsync(CancellationToken ct);
}
```

### 4. Implement Repository Adapter (Infrastructure)

```csharp
namespace Infrastructure.Persistence;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;
    
    public void Add(Order order) => _context.Orders.Add(order);
    public Task SaveChangesAsync(CancellationToken ct) => _context.SaveChangesAsync(ct);
}
```

## Common Patterns

| Pattern | When to Use |
| ------- | ----------- |
| Aggregate Root | Entity that owns a consistency boundary |
| Value Object | Immutable data with no identity (use `class` with init-only properties) |
| Domain Event | Notify other parts of the system about changes |
| Domain Service | Logic that spans multiple aggregates |
| Repository | Persistence abstraction (port in Domain, adapter in Infrastructure) |

## Related Skills

- **dotnet-libraries:** FluentValidation, Mediator, EF Core details
- **dotnet-ef-migrations:** Database migration patterns
- **dotnet-dependency-injection:** Service registration patterns
