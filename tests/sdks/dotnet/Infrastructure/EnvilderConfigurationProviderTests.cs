using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Envilder.Infrastructure;
using NSubstitute;

namespace Envilder.Tests.Infrastructure;

public class EnvilderConfigurationProviderTests
{
    [Fact]
    public void Should_PopulateConfigurationData_When_ProviderLoaded()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        secretProvider.GetSecretAsync("/Test/Token", Arg.Any<CancellationToken>())
            .Returns("secret-123");
        secretProvider.GetSecretAsync("/App/Db", Arg.Any<CancellationToken>())
            .Returns("db-pass");

        var client = new EnvilderClient(secretProvider);
        var mapFile = new ParsedMapFile
        {
            Config = new MapFileConfig(),
            Mappings = new Dictionary<string, string>
            {
                ["TOKEN"] = "/Test/Token",
                ["DB_PASS"] = "/App/Db",
            },
        };

        var sut = new EnvilderConfigurationProvider(client, mapFile);

        // Act
        sut.Load();

        // Assert
        sut.TryGet("TOKEN", out var token);
        token.Should().Be("secret-123");
        sut.TryGet("DB_PASS", out var db);
        db.Should().Be("db-pass");
    }
}
