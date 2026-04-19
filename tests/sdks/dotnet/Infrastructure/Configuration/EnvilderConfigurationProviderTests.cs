namespace Envilder.Tests.Infrastructure.Configuration;

using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Envilder.Infrastructure.Configuration;
using NSubstitute;

public class EnvilderConfigurationProviderTests
{
	[Fact]
	public void Should_PopulateConfigurationData_When_ProviderLoaded()
	{
		// Arrange
		var secretProvider = Substitute.For<ISecretProvider>();
		secretProvider.GetSecret("/Test/Token")
			.Returns("secret-123");
		secretProvider.GetSecret("/App/Db")
			.Returns("db-pass");

		var client = new EnvilderClient(secretProvider);
		var mapFile = new ParsedMapFile(
			new MapFileConfig(),
			new Dictionary<string, string>
			{
				["TOKEN"] = "/Test/Token",
				["DB_PASS"] = "/App/Db",
			});

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