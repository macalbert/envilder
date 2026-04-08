namespace Envilder.Tests.Infrastructure.Configuration;

using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Envilder.Infrastructure.Configuration;
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
    public void Should_BindDatabaseSection_When_KeysUseSlashHierarchy()
    {
        // Arrange
        _secretProvider
            .GetSecretAsync("/myapp/prod/pg-connection-string", Arg.Any<CancellationToken>())
            .Returns("Host=db.example.com;Port=5432;Database=orders;Username=app;Password=s3cret");
        _secretProvider
            .GetSecretAsync("/myapp/prod/pg-max-pool-size", Arg.Any<CancellationToken>())
            .Returns("100");

        var mapFile = new ParsedMapFile(
            new(),
            new()
            {
                ["Database/ConnectionString"] = "/myapp/prod/pg-connection-string",
                ["Database/MaxPoolSize"] = "/myapp/prod/pg-max-pool-size",
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

    private IConfigurationRoot CreateConfiguration(ParsedMapFile mapFile)
    {
        var client = new EnvilderClient(_secretProvider);
        var configuration = new ConfigurationBuilder()
            .Add(new EnvilderConfigurationSource(client, mapFile))
            .Build();
        return configuration;
    }

    [Fact]
    public void Should_BindOpenAiSection_When_KeysUseSlashHierarchy()
    {
        // Arrange
        _secretProvider
            .GetSecretAsync("/myapp/prod/openai-api-key", Arg.Any<CancellationToken>())
            .Returns("sk-proj-abc123");
        _secretProvider
            .GetSecretAsync("/myapp/prod/openai-model", Arg.Any<CancellationToken>())
            .Returns("gpt-4o");

        var mapFile = new ParsedMapFile(
            new(),
            new()
            {
                ["OpenAi/ApiKey"] = "/myapp/prod/openai-api-key",
                ["OpenAi/Model"] = "/myapp/prod/openai-model",
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