namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using AwesomeAssertions;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Configurations;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure.Aws;
using Testcontainers.LocalStack;

public class AwsSsmAcceptanceTests : IAsyncLifetime
{
    private const int _localstackInternalPort = 4566;

    private EnvilderClient? _sut;
    private LocalStackContainer? _localStack;
    private IAmazonSimpleSystemsManagement? _ssmClient;
    private MapFileParser _parser = new();

    public async Task InitializeAsync()
    {
        var environment = await LoadEnvironmentAsync();

        var waitStrategy = Wait.ForUnixContainer()
                     .UntilInternalTcpPortIsAvailable(_localstackInternalPort)
                     .AddCustomWaitStrategy(new LocalStackHealthCheck(_localstackInternalPort));

        _localStack = new LocalStackBuilder("localstack/localstack:stable")
            .WithEnvironment(environment)
            .WithName($"localstack-{Guid.CreateVersion7()}")
            .WithPortBinding(_localstackInternalPort, assignRandomHostPort: true)
            .WithBindMount("/var/run/docker.sock", "/var/run/docker.sock", AccessMode.ReadWrite)
            .WithWaitStrategy(waitStrategy)
            .Build();

        await _localStack.StartAsync();

        _ssmClient = new AmazonSimpleSystemsManagementClient(new AmazonSimpleSystemsManagementConfig
        {
            ServiceURL = _localStack.GetConnectionString()
        });

        _sut = new(new AwsSsmSecretProvider(_ssmClient));
    }

    public async Task DisposeAsync()
    {
        _ssmClient?.Dispose();

        if (_localStack is not null)
        {
            await _localStack.DisposeAsync();
        }
    }

    [Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
    public async Task Should_ResolveSecretFromSsm_When_ParameterExistsInLocalStack()
    {
        // Arrange
        await _ssmClient!.PutParameterAsync(new()
        {
            Name = "/Test/MySecret",
            Value = "real-secret-from-localstack",
            Type = ParameterType.SecureString,
            Overwrite = true,
        });

        var mapFile = new ParsedMapFile
        {
            Config = new(),
            Mappings = new()
            {
                ["MY_SECRET"] = "/Test/MySecret",
            },
        };

        // Act
        var actual = await _sut!.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().ContainKey("MY_SECRET");
        actual["MY_SECRET"].Should().Be("real-secret-from-localstack");
    }

    [Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
    public async Task Should_ReturnEmptyForMissingSsmParameter_When_ParameterDoesNotExist()
    {
        // Arrange
        var mapFile = new ParsedMapFile
        {
            Config = new(),
            Mappings = new()
            {
                ["NONEXISTENT"] = "/Test/DoesNotExist",
            },
        };

        // Act
        var actual = await _sut!.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().BeEmpty();
    }

    private async Task<IReadOnlyDictionary<string, string>> LoadEnvironmentAsync()
    {
        const string filename = "secrets-map.json";

        var assembly = typeof(AwsSsmAcceptanceTests).Assembly;
        var resourceName = $"{assembly.GetName().Name}.{filename}";

        using var stream = assembly.GetManifestResourceStream(resourceName)!;
        using var reader = new StreamReader(stream);
        var json = await reader.ReadToEndAsync();

        var mapFile = _parser.Parse(json);

        var envilder = new EnvilderClient(SecretProviderFactory.Create(mapFile.Config));
        var secrets = await envilder.ResolveSecretsAsync(mapFile);

        return secrets.AsReadOnly();
    }
}