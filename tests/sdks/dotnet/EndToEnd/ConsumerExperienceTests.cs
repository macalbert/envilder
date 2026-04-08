namespace Envilder.Tests.EndToEnd;

using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;
using Envilder.Infrastructure.Configuration;
using Envilder.Tests.Fixtures;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

[Collection(nameof(ContainersCollection))]
public class ConsumerExperienceTests : IAsyncLifetime
{
    private readonly LocalStackFixture _localStack;
    private readonly LowkeyVaultFixture _lowkeyVault;
    private readonly List<string> _tempFiles = [];

    public ConsumerExperienceTests(
        LocalStackFixture localStack,
        LowkeyVaultFixture lowkeyVault)
    {
        _localStack = localStack;
        _lowkeyVault = lowkeyVault;
    }

    public async Task InitializeAsync()
    {
        await SeedTestDataAsync();
    }

    public async Task DisposeAsync()
    {
        foreach (var file in _tempFiles)
        {
            if (File.Exists(file))
            {
                File.Delete(file);
            }
        }

        await Task.CompletedTask;
    }

    [Fact]
    public void Should_ExposeAwsSecretsViaIConfiguration_When_MapFileUsesDefaultAwsProvider()
    {
        // Arrange
        var mapFilePath = WriteTempMapFile("""
            {
                "$config": { "provider": "aws" },
                "DB_URL": "/e2e/db-url",
                "API_KEY": "/e2e/api-key"
            }
            """);

        var provider = CreateLocalStackSsmProvider();

        // Act
        var config = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, provider)
            .Build();

        // Assert
        config["DB_URL"].Should().Be("postgres://localhost:5432/mydb");
        config["API_KEY"].Should().Be("sk-test-12345");
    }

    [Fact]
    public void Should_ExposeAwsSecretsViaIConfiguration_When_MapFileIncludesProfileConfig()
    {
        // Arrange
        var mapFilePath = WriteTempMapFile("""
            {
                "$config": { "provider": "aws", "profile": "production" },
                "DB_URL": "/e2e/db-url"
            }
            """);

        var provider = CreateLocalStackSsmProvider();

        // Act
        var config = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, provider)
            .Build();

        // Assert
        config["DB_URL"].Should().Be("postgres://localhost:5432/mydb");
    }

    [Fact]
    public void Should_ExposeAzureSecretsViaIConfiguration_When_MapFileUsesAzureProvider()
    {
        // Arrange
        var mapFilePath = WriteTempMapFile($$"""
            {
                "$config": { "provider": "azure", "vaultUrl": "{{_lowkeyVault.VaultUrl}}" },
                "VAULT_SECRET": "e2e-secret"
            }
            """);

        var provider = new AzureKeyVaultSecretProvider(_lowkeyVault.SecretClient);

        // Act
        var config = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, provider)
            .Build();

        // Assert
        config["VAULT_SECRET"].Should().Be("azure-e2e-value");
    }

    [Fact]
    public void Should_ResolveSecretsViaHostBuilder_When_UsingConfigurationIntegration()
    {
        // Arrange
        var mapFilePath = WriteTempMapFile("""
            {
                "$config": { "provider": "aws" },
                "DB_URL": "/e2e/db-url",
                "API_KEY": "/e2e/api-key"
            }
            """);

        var provider = CreateLocalStackSsmProvider();

        var builder = Host.CreateApplicationBuilder();
        builder.Configuration.AddEnvilder(mapFilePath, provider);

        // Act
        using var host = builder.Build();
        var config = host.Services.GetRequiredService<IConfiguration>();

        // Assert
        config["DB_URL"].Should().Be("postgres://localhost:5432/mydb");
        config["API_KEY"].Should().Be("sk-test-12345");
    }

    [Fact]
    public void Should_ThrowFileNotFoundException_When_MapFileDoesNotExist()
    {
        // Arrange
        var provider = CreateLocalStackSsmProvider();

        // Act
        var act = () => new ConfigurationBuilder()
            .AddEnvilder("/nonexistent/secrets-map.json", provider)
            .Build();

        // Assert
        act.Should().Throw<FileNotFoundException>()
            .WithMessage("*Map file not found*");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_MapFilePathIsEmpty()
    {
        // Arrange
        var provider = CreateLocalStackSsmProvider();

        // Act
        var act = () => new ConfigurationBuilder()
            .AddEnvilder("", provider)
            .Build();

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("mapFilePath");
    }

    [Fact]
    public void Should_ThrowInvalidOperationException_When_AzureProviderMissingVaultUrl()
    {
        // Arrange
        var config = new MapFileConfig { Provider = SecretProviderType.Azure };

        // Act
        var act = () => SecretProviderFactory.Create(config);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Vault URL*");
    }

    [Fact]
    public async Task Should_OmitMissingSecrets_When_SomeParametersDoNotExistInStore()
    {
        // Arrange
        var mapFilePath = WriteTempMapFile("""
            {
                "$config": { "provider": "aws" },
                "DB_URL": "/e2e/db-url",
                "MISSING_KEY": "/e2e/does-not-exist"
            }
            """);

        var provider = CreateLocalStackSsmProvider();

        // Act
        var config = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, provider)
            .Build();

        // Assert
        config["DB_URL"].Should().Be("postgres://localhost:5432/mydb");
        config["MISSING_KEY"].Should().BeNull();

        await Task.CompletedTask;
    }

    private AwsSsmSecretProvider CreateLocalStackSsmProvider() =>
        _localStack.CreateProvider();

    private string WriteTempMapFile(string json)
    {
        var path = Path.Combine(Path.GetTempPath(), $"envilder-e2e-{Guid.NewGuid():N}.json");
        File.WriteAllText(path, json);
        _tempFiles.Add(path);
        return path;
    }

    private async Task SeedTestDataAsync()
    {
        await _localStack.SsmClient.PutParameterAsync(new PutParameterRequest
        {
            Name = "/e2e/db-url",
            Value = "postgres://localhost:5432/mydb",
            Type = ParameterType.SecureString,
            Overwrite = true,
        });

        await _localStack.SsmClient.PutParameterAsync(new PutParameterRequest
        {
            Name = "/e2e/api-key",
            Value = "sk-test-12345",
            Type = ParameterType.SecureString,
            Overwrite = true,
        });

        await _lowkeyVault.SecretClient.SetSecretAsync("e2e-secret", "azure-e2e-value");
    }
}