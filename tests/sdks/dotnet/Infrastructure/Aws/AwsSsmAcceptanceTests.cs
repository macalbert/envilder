namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure.Aws;
using Testcontainers.LocalStack;

public class AwsSsmAcceptanceTests : IAsyncLifetime
{
    private readonly LocalStackContainer _localStack = new LocalStackBuilder("localstack/localstack:4")
        .Build();

    private IAmazonSimpleSystemsManagement _ssmClient = null!;

    public async Task InitializeAsync()
    {
        await _localStack.StartAsync();

        _ssmClient = new AmazonSimpleSystemsManagementClient(new AmazonSimpleSystemsManagementConfig
        {
            ServiceURL = _localStack.GetConnectionString(),
            AuthenticationRegion = "us-east-1",
        });
    }

    public async Task DisposeAsync()
    {
        _ssmClient?.Dispose();
        await _localStack.DisposeAsync();
    }

    [Fact(Timeout = CancellationTokenForTest.LongTimeout)]
    public async Task Should_ResolveSecretFromSsm_When_ParameterExistsInLocalStack()
    {
        // Arrange
        await _ssmClient.PutParameterAsync(new PutParameterRequest
        {
            Name = "/Test/MySecret",
            Value = "real-secret-from-localstack",
            Type = ParameterType.SecureString,
            Overwrite = true,
        });

        var provider = new AwsSsmSecretProvider(_ssmClient);
        var sut = new EnvilderClient(provider);
        var mapFile = new ParsedMapFile
        {
            Config = new MapFileConfig(),
            Mappings = new Dictionary<string, string>
            {
                ["MY_SECRET"] = "/Test/MySecret",
            },
        };

        // Act
        var actual = await sut.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().ContainKey("MY_SECRET");
        actual["MY_SECRET"].Should().Be("real-secret-from-localstack");
    }

    [Fact(Timeout = CancellationTokenForTest.LongTimeout)]
    public async Task Should_ReturnEmptyForMissingSsmParameter_When_ParameterDoesNotExist()
    {
        // Arrange
        var provider = new AwsSsmSecretProvider(_ssmClient);
        var client = new EnvilderClient(provider);
        var mapFile = new ParsedMapFile
        {
            Config = new MapFileConfig(),
            Mappings = new Dictionary<string, string>
            {
                ["NONEXISTENT"] = "/Test/DoesNotExist",
            },
        };

        // Act
        var actual = await client.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().BeEmpty();
    }
}
