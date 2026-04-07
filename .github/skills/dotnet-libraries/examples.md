# Backend Libraries Examples

This document contains code examples for FluentValidation, Mediator, and Entity Framework Core.

## FluentValidation Examples

### Configuration Validator

```csharp
namespace M47.XXTemplateXX.Domain.Configurations.Validations;

using FluentValidation;

public class StripeConfigValidator : AbstractValidator<StripeConfig>
{
    public StripeConfigValidator()
    {
        RuleFor(x => x.SecretKey)
            .NotEmpty()
            .WithMessage("Stripe SecretKey must not be empty.")
            .Must(key => key.StartsWith("sk_"))
            .WithMessage("Stripe SecretKey must start with 'sk_'.");

        RuleFor(x => x.WebHookSecret)
            .NotEmpty()
            .WithMessage("Stripe WebHookSecret must not be empty.")
            .Must(secret => secret.StartsWith("whsec_"))
            .WithMessage("Stripe WebHookSecret must start with 'whsec_'.");
    }
}
```

### Nested Object Validation

```csharp
public class OrderValidator : AbstractValidator<Order>
{
    public OrderValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Order must have at least one item");

        RuleForEach(x => x.Items)
            .ChildRules(item =>
            {
                item.RuleFor(x => x.ProductId).NotEmpty();
                item.RuleFor(x => x.Quantity).GreaterThan(0);
            });
    }
}
```

### Conditional Validation

```csharp
public class PaymentValidator : AbstractValidator<PaymentRequest>
{
    public PaymentValidator()
    {
        RuleFor(x => x.CardNumber)
            .NotEmpty()
            .CreditCard()
            .When(x => x.PaymentMethod == PaymentMethod.Card);

        RuleFor(x => x.BankAccount)
            .NotEmpty()
            .When(x => x.PaymentMethod == PaymentMethod.BankTransfer);
    }
}
```

## Mediator Examples

### Command with Handler

```csharp
// Command
public class CreateGroupCommand : ICommand<CreateGroupResponse>
{
    public CreateGroupRequest Request { get; init; }

    public CreateGroupCommand(CreateGroupRequest request)
    {
        Request = request;
    }
}

// Response
public class CreateGroupResponse
{
    public Guid GroupId { get; init; }
}

// Handler
public class CreateGroupCommandHandler 
    : ICommandHandler<CreateGroupCommand, CreateGroupResponse>
{
    private readonly IXXTemplateXXRepository _repository;
    private readonly ILogger<CreateGroupCommandHandler> _logger;

    public CreateGroupCommandHandler(
        IXXTemplateXXRepository repository,
        ILogger<CreateGroupCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async ValueTask<CreateGroupResponse> Handle(
        CreateGroupCommand command, 
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating group with name {name}", command.Request.Name);

        var group = Group.Create(
            id: Guid.CreateVersion7(),
            name: command.Request.Name,
            type: command.Request.Type
        );

        _repository.AddGroup(group);
        await _repository.SaveChangesAsync(cancellationToken);

        return new CreateGroupResponse { GroupId = group.Id };
    }
}
```

### Query with Handler

```csharp
// Query
public class GetGroupByIdQuery : IQuery<GroupResponse>
{
    public Guid GroupId { get; init; }

    public GetGroupByIdQuery(Guid groupId)
    {
        GroupId = groupId;
    }
}

// Handler
public class GetGroupByIdQueryHandler 
    : IQueryHandler<GetGroupByIdQuery, GroupResponse>
{
    private readonly IReadXXTemplateXXRepository _repository;

    public GetGroupByIdQueryHandler(IReadXXTemplateXXRepository repository)
    {
        _repository = repository;
    }

    public async ValueTask<GroupResponse> Handle(
        GetGroupByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var group = await _repository.GetGroupByIdAsync(query.GroupId, cancellationToken)
            ?? throw new GroupNotFoundException($"Group {query.GroupId} not found");

        return new GroupResponse
        {
            Id = group.Id,
            Name = group.Name,
            Type = group.Type
        };
    }
}
```

### Pipeline Behavior (Caching)

```csharp
public class CachingBehavior<TRequest, TResponse> 
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

    public CachingBehavior(
        IDistributedCache cache,
        ILogger<CachingBehavior<TRequest, TResponse>> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async ValueTask<TResponse> Handle(
        TRequest request,
        MessageHandlerDelegate<TRequest, TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is not ICacheRequest cacheRequest)
        {
            return await next(request, cancellationToken);
        }

        var cacheKey = cacheRequest.CacheKey;
        var cachedResponse = await _cache.GetStringAsync(cacheKey, cancellationToken);
        
        if (cachedResponse is not null)
        {
            _logger.LogInformation("Cache hit for key {cacheKey}", cacheKey);
            return JsonSerializer.Deserialize<TResponse>(cachedResponse)!;
        }

        var response = await next(request, cancellationToken);

        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(response),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = cacheRequest.AbsoluteExpirationRelativeToNow
            },
            cancellationToken);

        return response;
    }
}
```

### Minimal API Endpoint

```csharp
public static class GroupEndpoints
{
    public static void MapGroupEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/groups")
            .WithTags("Groups");

        group.MapPost("", CreateGroupAsync);
        group.MapGet("{id:guid}", GetGroupByIdAsync);
    }

    private static async Task<IResult> CreateGroupAsync(
        CreateGroupRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateGroupCommand(request);
        var response = await sender.Send(command, cancellationToken);
        return Results.Created($"/api/groups/{response.GroupId}", response);
    }

    private static async Task<IResult> GetGroupByIdAsync(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetGroupByIdQuery(id);
        var response = await sender.Send(query, cancellationToken);
        return Results.Ok(response);
    }
}
```

## Entity Framework Core Examples

### DbContext Configuration

```csharp
public class XXTemplateXXDbContext : DbContext
{
    public XXTemplateXXDbContext(DbContextOptions<XXTemplateXXDbContext> options)
        : base(options) { }

    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Price> Prices => Set<Price>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(XXTemplateXXDbContext).Assembly);
    }
}
```

### Entity Configuration

```csharp
public class GroupConfiguration : IEntityTypeConfiguration<Group>
{
    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.ToTable("groups");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .IsRequired();

        builder.HasMany<Price>()
            .WithOne()
            .HasForeignKey(p => p.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(x => x.DomainEvents);
    }
}
```

### Repository Implementation

```csharp
public class XXTemplateXXRepository : IXXTemplateXXRepository, IReadXXTemplateXXRepository
{
    private readonly XXTemplateXXDbContext _context;

    public XXTemplateXXRepository(XXTemplateXXDbContext context)
    {
        _context = context;
    }

    // Write operations
    public void AddGroup(Group group) => _context.Groups.Add(group);
    public void UpdateGroup(Group group) => _context.Groups.Update(group);
    public Task SaveChangesAsync(CancellationToken ct) => _context.SaveChangesAsync(ct);

    // Read operations
    public async Task<Group?> GetGroupByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Groups
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == id, ct);
    }
}
```

## Manual Mapping Example

**No AutoMapper** - Use explicit mapping:

```csharp
private static GroupResponse MapToResponse(Group group)
{
    return new GroupResponse
    {
        Id = group.Id,
        Name = group.Name,
        Type = group.Type,
        CreatedAt = group.CreatedAt
    };
}
```
