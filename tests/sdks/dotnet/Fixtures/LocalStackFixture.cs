namespace Envilder.Tests.Fixtures;

using Amazon.SimpleSystemsManagement;
using DotNet.Testcontainers.Builders;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure;
using Envilder.Infrastructure.Aws;
using Envilder.Tests.Infrastructure.Aws;
using Testcontainers.LocalStack;

public sealed class LocalStackFixture : IAsyncLifetime
{
    private const int InternalPort = 4566;

    private LocalStackContainer _container = null!;

    public string ServiceUrl { get; private set; } = null!;

    public IAmazonSimpleSystemsManagement SsmClient { get; private set; } = null!;

    public AwsSsmSecretProvider CreateProvider() =>
        new(SsmClient);

    public async Task InitializeAsync()
    {
        var environment = await LoadEnvironmentAsync();

        var waitStrategy = Wait.ForUnixContainer()
            .UntilInternalTcpPortIsAvailable(InternalPort)
            .AddCustomWaitStrategy(new LocalStackHealthCheck(InternalPort));

        _container = new LocalStackBuilder("localstack/localstack:stable")
            .WithEnvironment(environment)
            .WithName($"localstack-{Guid.CreateVersion7()}")
            .WithPortBinding(InternalPort, assignRandomHostPort: true)
            .WithWaitStrategy(waitStrategy)
            .Build();

        await _container.StartAsync();

        ServiceUrl = _container.GetConnectionString();

        SsmClient = new AmazonSimpleSystemsManagementClient(
            new AmazonSimpleSystemsManagementConfig
            {
                ServiceURL = ServiceUrl,
            });
    }

    public async Task DisposeAsync()
    {
        SsmClient?.Dispose();

        if (_container is not null)
        {
            await _container.DisposeAsync();
        }
    }

    private static async Task<IReadOnlyDictionary<string, string>>
        LoadEnvironmentAsync()
    {
        const string filename = "secrets-map.json";

        var assembly = typeof(LocalStackFixture).Assembly;
        var resourceName = $"{assembly.GetName().Name}.{filename}";

        using var stream =
            assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' not found in assembly '{assembly.FullName}'.");
        using var reader = new StreamReader(stream);
        var json = await reader.ReadToEndAsync();

        var parser = new MapFileParser();
        var mapFile = parser.Parse(json);
        var client = ResolveClient(mapFile);
        var secrets = await client.ResolveSecretsAsync(mapFile);

        return secrets.AsReadOnly();
    }

    // Workaround: CI/CD pipelines may not have credentials configured for the
    // provider declared in the map file's $config section (e.g. Azure Key Vault).
    // When the configured provider cannot be created, fall back to AWS so the
    // integration tests can still run against LocalStack.
    private static EnvilderClient ResolveClient(ParsedMapFile mapFile)
    {
        try
        {
            return new(SecretProviderFactory.Create(mapFile.Config));
        }
        catch (Exception)
        {
            return new(SecretProviderFactory.Create(new() { Provider = SecretProviderType.Aws }));
        }
    }
}