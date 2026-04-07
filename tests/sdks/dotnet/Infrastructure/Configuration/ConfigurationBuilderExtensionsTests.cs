namespace Envilder.Tests.Infrastructure.Configuration;

using System.IO;
using Microsoft.Extensions.Configuration;
using AwesomeAssertions;
using Envilder.Domain.Ports;
using Envilder.Infrastructure.Configuration;
using NSubstitute;

public class ConfigurationBuilderExtensionsTests : IDisposable
{
    private readonly string _mapFilePath;

    public ConfigurationBuilderExtensionsTests()
    {
        _mapFilePath = Path.GetTempFileName();
        File.WriteAllText(_mapFilePath, """
            {
                "TOKEN": "/Test/Token",
                "DB_PASS": "/App/Db"
            }
            """);
    }

    public void Dispose()
    {
        if (File.Exists(_mapFilePath))
        {
            File.Delete(_mapFilePath);
        }
    }

    [Fact]
    public void Should_ThrowFileNotFoundException_When_MapFileDoesNotExist()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        var builder = new ConfigurationBuilder();

        // Act
        var act = () => builder.AddEnvilder("/nonexistent/path/map.json", secretProvider);

        // Assert
        act.Should().Throw<FileNotFoundException>();
    }

    [Fact]
    public void Should_ThrowArgumentException_When_MapFilePathIsNullOrEmpty()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        var builder = new ConfigurationBuilder();

        // Act
        var act = () => builder.AddEnvilder("", secretProvider);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("mapFilePath");
    }

    [Fact]
    public void Should_ExposeSecretsViaIConfiguration_When_AddEnvilderCalled()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        secretProvider.GetSecretAsync("/Test/Token", Arg.Any<CancellationToken>())
            .Returns("secret-token");
        secretProvider.GetSecretAsync("/App/Db", Arg.Any<CancellationToken>())
            .Returns("secret-db");

        // Act
        var actual = new ConfigurationBuilder()
            .AddEnvilder(_mapFilePath, secretProvider)
            .Build();

        // Assert
        actual["TOKEN"].Should().Be("secret-token");
        actual["DB_PASS"].Should().Be("secret-db");
    }
}
