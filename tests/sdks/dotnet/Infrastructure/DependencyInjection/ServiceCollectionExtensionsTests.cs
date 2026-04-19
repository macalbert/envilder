namespace Envilder.Tests.Infrastructure.DependencyInjection;

using AwesomeAssertions;
using Envilder.Infrastructure.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using System.IO;

public class ServiceCollectionExtensionsTests
{
	[Fact]
	public void Should_ThrowFileNotFoundException_When_MapFileDoesNotExist()
	{
		// Arrange
		var services = new ServiceCollection();

		// Act
		var act = () => services.AddEnvilder("/nonexistent/path/map.json");

		// Assert
		act.Should().Throw<FileNotFoundException>();
	}

	[Fact]
	public void Should_ThrowArgumentException_When_MapFilePathIsEmpty()
	{
		// Arrange
		var services = new ServiceCollection();

		// Act
		var act = () => services.AddEnvilder(string.Empty);

		// Assert
		act.Should().Throw<ArgumentException>()
			.WithParameterName("mapFilePath");
	}
}