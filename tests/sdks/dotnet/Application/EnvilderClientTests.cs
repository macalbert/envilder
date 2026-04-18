namespace Envilder.Tests.Application;

using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Domain.Ports;
using NSubstitute;

public class EnvilderClientTests : IDisposable
{
    private readonly List<string> _envVarsToClean = new();

    public void Dispose()
    {
        foreach (var key in _envVarsToClean)
        {
            Environment.SetEnvironmentVariable(key, null);
        }
    }

    [Fact]
    public void Should_SetEnvironmentVariables_When_InjectIntoEnvironmentCalled()
    {
        // Arrange
        var secrets = new Dictionary<string, string>
        {
            ["INJECT_TEST_MY_TOKEN"] = "token-123",
            ["INJECT_TEST_MY_DB"] = "conn-string",
        };
        _envVarsToClean.AddRange(secrets.Keys);

        // Act
        EnvilderClient.InjectIntoEnvironment(secrets);

        // Assert
        Environment.GetEnvironmentVariable("INJECT_TEST_MY_TOKEN").Should().Be("token-123");
        Environment.GetEnvironmentVariable("INJECT_TEST_MY_DB").Should().Be("conn-string");
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
    public async Task Should_ResolveAllSecrets_When_MapFileHasMultipleMappings()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        secretProvider.GetSecretAsync("/Test/Token", Arg.Any<CancellationToken>())
            .Returns("token-value");
        secretProvider.GetSecretAsync("/App/DbPassword", Arg.Any<CancellationToken>())
            .Returns("db-password");

        var mapFile = new ParsedMapFile(
            new MapFileConfig(),
            new Dictionary<string, string>
            {
                ["TOKEN_SECRET"] = "/Test/Token",
                ["DB_PASSWORD"] = "/App/DbPassword",
            });

        var sut = new EnvilderClient(secretProvider);

        // Act
        var actual = await sut.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().HaveCount(2);
        actual["TOKEN_SECRET"].Should().Be("token-value");
        actual["DB_PASSWORD"].Should().Be("db-password");
    }

    [Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
    public async Task Should_SkipNullSecrets_When_ProviderReturnsNull()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        secretProvider.GetSecretAsync("/App/DbPassword", Arg.Any<CancellationToken>())
            .Returns("db-password");
        secretProvider.GetSecretAsync("/Missing/Secret", Arg.Any<CancellationToken>())
            .Returns((string)null!);

        var mapFile = new ParsedMapFile(
            new MapFileConfig(),
            new Dictionary<string, string>
            {
                ["DB_PASSWORD"] = "/App/DbPassword",
                ["MISSING_KEY"] = "/Missing/Secret",
            });

        var sut = new EnvilderClient(secretProvider);

        // Act
        var actual = await sut.ResolveSecretsAsync(mapFile);

        // Assert
        actual.Should().HaveCount(1);
        actual.Should().ContainKey("DB_PASSWORD");
        actual.Should().NotContainKey("MISSING_KEY");
    }

    [Fact]
    public void Should_ResolveAllSecrets_When_ResolveSecretsCalledSync()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        secretProvider.GetSecret("/Test/Token").Returns("token-value");
        secretProvider.GetSecret("/App/DbPassword").Returns("db-password");

        var mapFile = new ParsedMapFile(
            new MapFileConfig(),
            new Dictionary<string, string>
            {
                ["TOKEN_SECRET"] = "/Test/Token",
                ["DB_PASSWORD"] = "/App/DbPassword",
            });

        var sut = new EnvilderClient(secretProvider);

        // Act
        var actual = sut.ResolveSecrets(mapFile);

        // Assert
        actual.Should().HaveCount(2);
        actual["TOKEN_SECRET"].Should().Be("token-value");
        actual["DB_PASSWORD"].Should().Be("db-password");
    }
}
