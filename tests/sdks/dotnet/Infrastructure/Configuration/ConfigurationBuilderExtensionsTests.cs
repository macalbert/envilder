namespace Envilder.Tests.Infrastructure.Configuration;

using AwesomeAssertions;
using Envilder.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;
using System.IO;

public class ConfigurationBuilderExtensionsTests
{
	[Fact]
	public void Should_ThrowFileNotFoundException_When_MapFileDoesNotExist()
	{
		// Arrange
		var builder = new ConfigurationBuilder();

		// Act
		var act = () => builder.AddEnvilder("/nonexistent/path/map.json");

		// Assert
		act.Should().Throw<FileNotFoundException>();
	}

	[Fact]
	public void Should_ThrowArgumentException_When_MapFilePathIsNullOrEmpty()
	{
		// Arrange
		var builder = new ConfigurationBuilder();

		// Act
		var act = () => builder.AddEnvilder(string.Empty);

		// Assert
		act.Should().Throw<ArgumentException>()
			.WithParameterName("mapFilePath");
	}
}