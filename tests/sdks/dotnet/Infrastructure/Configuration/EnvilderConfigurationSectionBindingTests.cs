namespace Envilder.Tests.Infrastructure.Configuration;

using AwesomeAssertions;
using global::Envilder.Domain.Ports;
using global::Envilder.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using NSubstitute;

public class EnvilderConfigurationSectionBindingTests
{
	private readonly ISecretProvider _secretProvider;

	public EnvilderConfigurationSectionBindingTests()
	{
		_secretProvider = Substitute.For<ISecretProvider>();
	}

	[Fact]
	public void Should_BindDatabaseSection_When_KeysUseDoubleUnderscoreHierarchy()
	{
		// Arrange
		_secretProvider
			.GetSecret("/myapp/prod/pg-connection-string")
			.Returns("Host=db.example.com;Port=5432;Database=orders;Username=app;Password=s3cret");
		_secretProvider
			.GetSecret("/myapp/prod/pg-max-pool-size")
			.Returns("100");

		var mapFile = new ParsedMapFile(
			new(),
			new()
			{
				["Database__ConnectionString"] = "/myapp/prod/pg-connection-string",
				["Database__MaxPoolSize"] = "/myapp/prod/pg-max-pool-size",
			});
		var configuration = CreateConfiguration(mapFile);

		var provider = new ServiceCollection()
			.Configure<DatabaseConfig>(configuration.GetSection(DatabaseConfig.SectionName))
			.BuildServiceProvider();

		// Act
		var actual = provider.GetRequiredService<IOptions<DatabaseConfig>>().Value;

		// Assert
		actual.ConnectionString.Should().Be("Host=db.example.com;Port=5432;Database=orders;Username=app;Password=s3cret");
		actual.MaxPoolSize.Should().Be("100");
	}

	[Fact]
	public void Should_BindOpenAiSection_When_KeysUseDoubleUnderscoreHierarchy()
	{
		// Arrange
		_secretProvider
			.GetSecret("/myapp/prod/openai-api-key")
			.Returns("sk-proj-abc123");
		_secretProvider
			.GetSecret("/myapp/prod/openai-model")
			.Returns("gpt-4o");

		var mapFile = new ParsedMapFile(
			new(),
			new()
			{
				["OpenAi__ApiKey"] = "/myapp/prod/openai-api-key",
				["OpenAi__Model"] = "/myapp/prod/openai-model",
			});

		var configuration = CreateConfiguration(mapFile);

		var provider = new ServiceCollection()
			.Configure<OpenAiConfig>(configuration.GetSection(OpenAiConfig.SectionName))
			.BuildServiceProvider();

		// Act
		var actual = provider.GetRequiredService<IOptions<OpenAiConfig>>().Value;

		// Assert
		actual.ApiKey.Should().Be("sk-proj-abc123");
		actual.Model.Should().Be("gpt-4o");
	}

	[Fact]
	public void Should_BindSection_When_MapFileJsonUsesDoubleUnderscoreHierarchy()
	{
		// Arrange
		_secretProvider
			.GetSecret("/myapp/prod/pg-connection-string")
			.Returns("Host=db.example.com");
		_secretProvider
			.GetSecret("/myapp/prod/pg-max-pool-size")
			.Returns("50");

		var mapFile = new MapFileParser().Parse("""
			{
				"Database__ConnectionString": "/myapp/prod/pg-connection-string",
				"Database__MaxPoolSize": "/myapp/prod/pg-max-pool-size"
			}
			""");
		var configuration = CreateConfiguration(mapFile);

		// Act
		var actual = configuration.GetSection(DatabaseConfig.SectionName);

		// Assert
		actual["ConnectionString"].Should().Be("Host=db.example.com");
		actual["MaxPoolSize"].Should().Be("50");
	}

	private IConfigurationRoot CreateConfiguration(ParsedMapFile mapFile)
	{
		var client = new EnvilderClient(_secretProvider);
		var configuration = new ConfigurationBuilder()
			.Add(new EnvilderConfigurationSource(client, mapFile))
			.Build();
		return configuration;
	}

	private class DatabaseConfig
	{
		public const string SectionName = "Database";
		public string ConnectionString { get; set; } = string.Empty;
		public string MaxPoolSize { get; set; } = string.Empty;
	}

	private class OpenAiConfig
	{
		public const string SectionName = "OpenAi";
		public string ApiKey { get; set; } = string.Empty;
		public string Model { get; set; } = string.Empty;
	}
}