namespace YourNamespace.Domain.DomainEvents;

public abstract class DomainEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}

public class EntityCreatedDomainEvent : DomainEvent
{
    public Guid EntityId { get; init; }
    public string Name { get; init; } = string.Empty;
}

public class EntityUpdatedDomainEvent : DomainEvent
{
    public Guid EntityId { get; init; }
    public string NewName { get; init; } = string.Empty;
}

public class EntityArchivedDomainEvent : DomainEvent
{
    public Guid EntityId { get; init; }
}
