using System.IO;
using Microsoft.Extensions.DependencyInjection;
using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain.Ports;
using Envilder.Infrastructure;
using NSubstitute;

namespace Envilder.Tests.Infrastructure;

public class ServiceCollectionExtensionsTests : IDisposable
{
    private readonly string _mapFilePath;

    public ServiceCollectionExtensionsTests()
    {
        _mapFilePath = Path.GetTempFileName();
        File.WriteAllText(_mapFilePath, """
            {
                "TOKEN": "/Test/Token"
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
    public void Should_RegisterEnvilderClient_When_AddEnvilderServicesCalled()
    {
        // Arrange
        var secretProvider = Substitute.For<ISecretProvider>();
        var services = new ServiceCollection();

        // Act
        services.AddEnvilder(_mapFilePath, secretProvider);
        var provider = services.BuildServiceProvider();
        var client = provider.GetService<EnvilderClient>();

        // Assert
        client.Should().NotBeNull();
        client.Should().BeOfType<EnvilderClient>();
    }
}
