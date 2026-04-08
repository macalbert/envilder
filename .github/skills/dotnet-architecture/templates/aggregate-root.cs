namespace YourNamespace.Domain.Entities;

public sealed class EntityName : AggregateRoot<Guid>
{
    public override Guid Id { get; protected init; }
    public string Name { get; private set; } = string.Empty;
    public EntityStatus Status { get; private set; }
    public DateTime CreatedAt { get; private init; }
    public DateTime? UpdatedAt { get; private set; }

    public static EntityName Create(Guid id, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name is required", nameof(name));
        }

        var entity = new EntityName
        {
            Id = id,
            Name = name,
            Status = EntityStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        entity.Record(new EntityCreatedDomainEvent { EntityId = entity.Id, Name = entity.Name });

        return entity;
    }

    public void UpdateName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
        {
            throw new ArgumentException("Name is required", nameof(newName));
        }

        if (Status == EntityStatus.Archived)
        {
            throw new InvalidOperationException("Cannot update archived entity");
        }

        Name = newName;
        UpdatedAt = DateTime.UtcNow;

        Record(new EntityUpdatedDomainEvent { EntityId = Id, NewName = newName });
    }

    public void Archive()
    {
        if (Status == EntityStatus.Archived)
        {
            throw new InvalidOperationException("Entity is already archived");
        }

        Status = EntityStatus.Archived;
        UpdatedAt = DateTime.UtcNow;

        Record(new EntityArchivedDomainEvent { EntityId = Id });
    }

#pragma warning disable CS8618
    private EntityName()
#pragma warning restore CS8618
    {
    }
}
