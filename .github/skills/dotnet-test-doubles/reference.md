# Test Doubles Reference

This document contains extended examples and patterns for test doubles.

## AutoFixture Patterns

### Basic Usage

```csharp
var fixture = new Fixture();

// Create random primitive
var id = fixture.Create<Guid>();
var name = fixture.Create<string>();
var count = fixture.Create<int>();

// Create complex object
var request = fixture.Create<CreateGroupRequest>();
```

### Customization

```csharp
var fixture = new Fixture();

// Customize specific property
fixture.Customize<Group>(c => c
    .With(g => g.Name, "Fixed Name")
    .With(g => g.Type, GroupType.Recurring));

var group = fixture.Create<Group>();
```

### Create Many

```csharp
var fixture = new Fixture();

// Create collection
var groups = fixture.CreateMany<Group>(10);

// Create specific count
var prices = fixture.Build<Price>()
    .CreateMany(5);
```

## Bogus Patterns

### Basic Faker

```csharp
var faker = new Faker();

var id = faker.Random.Guid();
var name = faker.Commerce.ProductName();
var email = faker.Internet.Email();
var price = faker.Finance.Amount(min: 1, max: 100);
var date = faker.Date.Past(years: 1);
```

### Typed Faker

```csharp
var groupFaker = new Faker<Group>()
    .CustomInstantiator(f => Group.Create(
        id: f.Random.Guid(),
        name: f.Commerce.ProductName(),
        type: f.PickRandom<GroupType>()))
    .RuleFor(g => g.CreatedAt, f => f.Date.Past());

var group = groupFaker.Generate();
var groups = groupFaker.Generate(10); // Generate 10
```

### Seeded Faker

```csharp
// Use seed for reproducible tests
var faker = new Faker { Random = new Randomizer(666) };

var name1 = faker.Commerce.ProductName(); // Always same value
var name2 = faker.Commerce.ProductName(); // Always same sequence
```

## NSubstitute Advanced Patterns

### Multiple Calls

```csharp
// Setup different returns for consecutive calls
repository
    .GetGroupByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
    .Returns(firstGroup, secondGroup, thirdGroup);
```

### Throwing Exceptions

```csharp
// Setup to throw exception
repository
    .GetGroupByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
    .Throws(new GroupNotFoundException("Group not found"));
```

### Callback Actions

```csharp
// Execute action when method is called
var capturedGroup = null as Group;

repository
    .When(x => x.AddGroup(Arg.Any<Group>()))
    .Do(callInfo => capturedGroup = callInfo.Arg<Group>());

// Later verify
capturedGroup.Should().NotBeNull();
capturedGroup.Name.Should().Be("Expected Name");
```

### Argument Matching

```csharp
// Conditional matching
repository.GetGroupByIdAsync(
    Arg.Is<Guid>(id => id != Guid.Empty),
    Arg.Any<CancellationToken>());

// Complex matching
repository.UpdateGroup(
    Arg.Is<Group>(g => 
        g.Name.StartsWith("Test") && 
        g.Type == GroupType.Recurring));
```

## WireMock Advanced Patterns

### Request Matching

```csharp
_wireMock
    .Given(Request.Create()
        .WithPath("/api/tipsters/*")
        .WithParam("active", "true")
        .WithHeader("Authorization", "Bearer *")
        .UsingGet())
    .RespondWith(Response.Create()
        .WithStatusCode(200)
        .WithBodyAsJson(response));
```

### Response Delays

```csharp
_wireMock
    .Given(Request.Create()
        .WithPath("/api/slow-endpoint")
        .UsingGet())
    .RespondWith(Response.Create()
        .WithStatusCode(200)
        .WithDelay(TimeSpan.FromSeconds(5))
        .WithBody("Slow response"));
```

### Dynamic Responses

```csharp
_wireMock
    .Given(Request.Create()
        .WithPath("/api/tipsters/*")
        .UsingGet())
    .RespondWith(Response.Create()
        .WithTransformer()
        .WithBody(context =>
        {
            var id = context.Request.PathSegments[2];
            return $"{{\"id\": \"{id}\", \"name\": \"Tipster {id}\"}}";
        }));
```

## Mother Pattern Advanced

### Chaining Mothers

```csharp
public sealed class SubscriptionMother
{
    private readonly GroupMother _groupMother;
    private readonly PriceMother _priceMother;
    private readonly Faker _faker;

    public SubscriptionMother(int seed = 666)
    {
        _faker = new Faker { Random = new Randomizer(seed) };
        _groupMother = new GroupMother(seed);
        _priceMother = new PriceMother(seed);
    }

    public Subscription Create(
        Guid? id = null,
        Group? group = null,
        Price? price = null)
    {
        return Subscription.Create(
            id: id ?? _faker.Random.Guid(),
            group: group ?? _groupMother.Create(),
            price: price ?? _priceMother.Create()
        );
    }
}
```

### Builder Pattern with Mother

```csharp
public sealed class GroupBuilder
{
    private Guid? _id;
    private string? _name;
    private GroupType? _type;
    private readonly Faker _faker = new();

    public GroupBuilder WithId(Guid id)
    {
        _id = id;
        return this;
    }

    public GroupBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public GroupBuilder WithType(GroupType type)
    {
        _type = type;
        return this;
    }

    public Group Build()
    {
        return Group.Create(
            id: _id ?? _faker.Random.Guid(),
            name: _name ?? _faker.Commerce.ProductName(),
            type: _type ?? _faker.PickRandom<GroupType>()
        );
    }
}

// Usage
var group = new GroupBuilder()
    .WithName("Premium Group")
    .WithType(GroupType.Recurring)
    .Build();
```
