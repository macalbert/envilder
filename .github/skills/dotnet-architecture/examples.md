# Backend Architecture Examples

This document contains detailed code examples for implementing DDD, CQRS, and Clean Architecture patterns in .NET.

## Domain Layer Examples

### Aggregate Root Base Class

```csharp
public abstract class AggregateRoot<TId>
{
    public abstract TId Id { get; protected init; }
    
    private List<DomainEvent> _domainEvents = new();
    
    public IReadOnlyCollection<DomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    
    protected void Record(DomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
    
    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
```

### Aggregate Root Implementation

```csharp
public sealed class Order : AggregateRoot<Guid>
{
    public override Guid Id { get; protected init; }
    public string CustomerName { get; private set; } = string.Empty;
    public OrderStatus Status { get; private set; }
    
    public static Order Create(Guid id, string customerName)
    {
        var order = new Order
        {
            Id = id,
            CustomerName = customerName,
            Status = OrderStatus.Pending
        };
        
        order.Record(new OrderCreatedDomainEvent { OrderId = order.Id, CustomerName = order.CustomerName });
        
        return order;
    }
    
    public void Ship()
    {
        if (Status != OrderStatus.Pending)
        {
            throw new InvalidOperationException("Only pending orders can be shipped");
        }
            
        Status = OrderStatus.Shipped;
        Record(new OrderShippedDomainEvent { OrderId = Id });
    }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    private Order()
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    {
    }
}
```

### Value Object

```csharp
public class Money
{
    public decimal Amount { get; init; }
    public string Currency { get; init; }

    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
        {
            throw new InvalidOperationException("Cannot add different currencies");
        }

        return new Money(Amount + other.Amount, Currency);
    }
}

var price1 = new Money(100, "USD");
var price2 = new Money(50, "USD");
var total = price1.Add(price2);
```

### Domain Events

```csharp
public abstract class DomainEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}

public class OrderCreatedDomainEvent : DomainEvent
{
    public Guid OrderId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
}

public class OrderShippedDomainEvent : DomainEvent
{
    public Guid OrderId { get; init; }
}
```

### Domain Service

```csharp
public class PricingService
{
    public decimal CalculateDiscount(IEnumerable<Product> products, Customer customer)
    {
        return products
            .Where(p => p.Category == customer.PreferredCategory)
            .Sum(p => p.Price * 0.1m);
    }
}
```

## Application Layer Examples

### Command with Handler

```csharp
public class CreateOrderCommand : ICommand<CreateOrderResponse>
{
    public string CustomerName { get; init; } = string.Empty;
    public List<OrderItem> Items { get; init; } = new();
}

public class CreateOrderResponse
{
    public Guid OrderId { get; init; }
}

public class CreateOrderCommandHandler 
    : ICommandHandler<CreateOrderCommand, CreateOrderResponse>
{
    private readonly IOrderRepository _repository;
    private readonly ILogger<CreateOrderCommandHandler> _logger;

    public CreateOrderCommandHandler(
        IOrderRepository repository,
        ILogger<CreateOrderCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async ValueTask<CreateOrderResponse> Handle(
        CreateOrderCommand command, 
        CancellationToken cancellationToken)
    {
        ValidateCommand(command);

        var order = Order.Create(
            id: Guid.CreateVersion7(),
            customerName: command.CustomerName);

        foreach (var item in command.Items)
        {
            order.AddItem(item);
        }

        _repository.Add(order);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Order {orderId} created", order.Id);
        return new CreateOrderResponse { OrderId = order.Id };
    }
    
    private static void ValidateCommand(CreateOrderCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.CustomerName))
        {
            throw new ArgumentException("Customer name is required");
        }
            
        if (!command.Items.Any())
        {
            throw new ArgumentException("Order must have at least one item");
        }
    }
}
```

### Query with Handler

```csharp
public class GetOrderByIdQuery : IQuery<OrderResponse>
{
    public Guid OrderId { get; init; }
}

public class OrderResponse
{
    public Guid Id { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public OrderStatus Status { get; init; }
}

public class GetOrderByIdQueryHandler 
    : IQueryHandler<GetOrderByIdQuery, OrderResponse>
{
    private readonly IReadOrderRepository _repository;

    public GetOrderByIdQueryHandler(IReadOrderRepository repository)
    {
        _repository = repository;
    }

    public async ValueTask<OrderResponse> Handle(
        GetOrderByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var order = await _repository.GetByIdAsync(query.OrderId, cancellationToken)
            ?? throw new OrderNotFoundException($"Order {query.OrderId} not found");
            
        return MapToResponse(order);
    }
    
    private static OrderResponse MapToResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            CustomerName = order.CustomerName,
            Status = order.Status
        };
    }
}
```

## Infrastructure Layer Examples

### Repository Port (Domain)

```csharp
namespace YourApp.Domain.Ports;

public interface IOrderRepository
{
    void Add(Order order);
    void Update(Order order);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IReadOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IEnumerable<Order>> GetByCustomerAsync(string customerId, CancellationToken cancellationToken);
}
```

### Repository Adapter (Infrastructure)

```csharp
namespace YourApp.Infrastructure.Persistence;

public class OrderRepository : IOrderRepository, IReadOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public void Add(Order order)
    {
        _context.Orders.Add(order);
    }

    public void Update(Order order)
    {
        _context.Orders.Update(order);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }
}
```

## Presentation Layer Examples

### Minimal API Endpoints

```csharp
public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders")
            .WithTags("Orders");

        group.MapPost("", CreateOrderAsync);
        group.MapGet("{id:guid}", GetOrderByIdAsync);
        group.MapPut("{id:guid}/ship", ShipOrderAsync);
    }

    private static async Task<IResult> CreateOrderAsync(
        CreateOrderRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateOrderCommand(request.CustomerName, request.Items);
        var response = await sender.Send(command, cancellationToken);
        
        return Results.Created($"/api/orders/{response.OrderId}", response);
    }

    private static async Task<IResult> GetOrderByIdAsync(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetOrderByIdQuery(id);
        var response = await sender.Send(query, cancellationToken);
        
        return Results.Ok(response);
    }
}
```

## Common Pitfalls Examples

### ✗ Mixing Domain and Infrastructure

```csharp
// BAD: Domain entity depends on infrastructure
public class Order : AggregateRoot<Guid>
{
    public async Task SendNotificationAsync(IEmailService emailService)
    {
        await emailService.SendAsync("Order created", ...);
    }
}

// GOOD: Keep domain pure, handle in application layer
public class CreateOrderCommandHandler : ICommandHandler<...>
{
    public async ValueTask<CreateOrderResponse> Handle(...)
    {
        var order = Order.Create(...);
        _repository.Add(order);
        await _repository.SaveChangesAsync(cancellationToken);

        await _emailService.SendAsync("Order created", ...);
    }
}
```

### ✗ Business Logic in Handlers

```csharp
// BAD: Business logic in handler
public async ValueTask Handle(ShipOrderCommand command, ...)
{
    var order = await _repository.GetByIdAsync(command.OrderId);
    
    if (order.Status != OrderStatus.Pending)
    {
        throw new InvalidOperationException("Cannot ship");
    }
    
    order.Status = OrderStatus.Shipped; // Direct state mutation
}

// GOOD: Business logic in domain
public async ValueTask Handle(ShipOrderCommand command, ...)
{
    var order = await _repository.GetByIdAsync(command.OrderId);
    
    order.Ship(); // Domain method encapsulates rules
    
    _repository.Update(order);
    await _repository.SaveChangesAsync(cancellationToken);
}
```

### ✗ Anemic Domain Model

```csharp
// BAD: Anemic model (just data, no behavior)
public class Order
{
    public Guid Id { get; set; }
    public OrderStatus Status { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

// GOOD: Rich domain model
public class Order : AggregateRoot<Guid>
{
    public Guid Id { get; private init; }
    public OrderStatus Status { get; private set; }
    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    
    public void Ship()
    {
        if (Status != OrderStatus.Pending)
        {
            throw new InvalidOperationException("Only pending orders can ship");
        }
        
        Status = OrderStatus.Shipped;
    }
}
```
