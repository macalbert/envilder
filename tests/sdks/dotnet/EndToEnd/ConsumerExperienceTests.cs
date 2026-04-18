namespace Envilder.Tests.EndToEnd;

using Amazon.SimpleSystemsManagement;
using AwesomeAssertions;
using Envilder.Domain;
using Envilder.Infrastructure;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;
using Envilder.Infrastructure.Configuration;
using Envilder.Tests.Fixtures;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using EnvilderFacade = Envilder.Application.Envilder;

[Collection(nameof(ContainersCollection))]
public class ConsumerExperienceTests : IAsyncLifetime
{
    private readonly LocalStackFixture _localStack;
    private readonly LowkeyVaultFixture _lowkeyVault;

    private readonly AwsSsmSecretProvider _awsProvider;
    private readonly AzureKeyVaultSecretProvider _azureProvider;
    private readonly List<string> _tempFiles = [];

    private static readonly string[] FacadeEnvVars =
    [
        "AWS_ENDPOINT_URL", "AWS_SERVICE_URL",
        "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_DEFAULT_REGION",
        "FACADE_RESOLVE", "FACADE_LOAD",
    ];

    private (string Name, string? Value)[] _originalEnvValues = [];

    public ConsumerExperienceTests(LocalStackFixture localStack,
                                   LowkeyVaultFixture lowkeyVault)
    {
        _localStack = localStack;
        _lowkeyVault = lowkeyVault;
        _awsProvider = _localStack.CreateProvider();
        _azureProvider = new(_lowkeyVault.SecretClient);
    }

    public Task InitializeAsync()
    {
        _originalEnvValues = FacadeEnvVars
            .Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
            .ToArray();

        Environment.SetEnvironmentVariable("AWS_ENDPOINT_URL", _localStack.ServiceUrl);
        Environment.SetEnvironmentVariable("AWS_SERVICE_URL", _localStack.ServiceUrl);
        Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", "test");
        Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", "test");
        Environment.SetEnvironmentVariable("AWS_DEFAULT_REGION", "us-east-1");

        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        foreach (var (name, value) in _originalEnvValues)
        {
            Environment.SetEnvironmentVariable(name, value);
        }

        foreach (var file in _tempFiles)
        {
            if (File.Exists(file))
            {
                File.Delete(file);
            }
        }

        return Task.CompletedTask;
    }

    [Fact]
    public async Task Should_ExposeAwsSecretsViaIConfiguration_When_MapFileUsesDefaultAwsProvider()
    {
        // Arrange
        var apikeyName = "/e2e/api-key";
        var expectedApikey = "sk-test-12345";
        await PutAwsParameterAsync(apikeyName, expectedApikey);
        var connectionStringName = "/e2e/db-url";
        var expectedConnectionString = "postgres://localhost:5432/mydb";
        await PutAwsParameterAsync(connectionStringName, expectedConnectionString);

        var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "DB_URL": "{{connectionStringName}}",
                "API_KEY": "{{apikeyName}}"
            }
            """);

        // Act
        var actual = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, _awsProvider)
            .Build();

        // Assert
        actual["DB_URL"].Should().Be(expectedConnectionString);
        actual["API_KEY"].Should().Be(expectedApikey);
    }

    [Fact]
    public async Task Should_ExposeAwsSecretsViaIConfiguration_When_MapFileIncludesProfileConfig()
    {
        // Arrange
        var connectionStringName = "/e2e/db2-url";
        var expectedConnectionString = "postgres://localhost:5432/mydb2";
        await PutAwsParameterAsync(connectionStringName, expectedConnectionString);

        var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws",  "profile": "production" },
                "DB_URL": "{{connectionStringName}}"
            }
            """);

        // Act
        var config = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, _awsProvider)
            .Build();

        // Assert
        config["DB_URL"].Should().Be(expectedConnectionString);
    }

    [Fact]
    public async Task Should_ExposeAzureSecretsViaIConfiguration_When_MapFileUsesAzureProvider()
    {
        // Arrange
        var name = "e2e-vault-secret";
        var expectedSecret = "azure-e2e-value";
        await _lowkeyVault.SecretClient.SetSecretAsync(name, expectedSecret);

        var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "azure", "vaultUrl": "{{_lowkeyVault.VaultUrl}}" },
                "VAULT_SECRET": "{{name}}"
            }
            """);

        // Act
        var config = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, _azureProvider)
            .Build();

        // Assert
        config["VAULT_SECRET"].Should().Be(expectedSecret);
    }

    [Fact]
    public async Task Should_ResolveSecretsViaHostBuilder_When_UsingConfigurationIntegration()
    {
        // Arrange
        var name = "/e2e/db4-url";
        var expectedValue = "postgres://localhost:5432/mydb4";
        await PutAwsParameterAsync(name, expectedValue);

        var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "DB_URL": "{{name}}"
            }
            """);

        var builder = Host.CreateApplicationBuilder();
        builder.Configuration.AddEnvilder(mapFilePath, _awsProvider);
        using var host = builder.Build();

        // Act
        var config = host.Services.GetRequiredService<IConfiguration>();

        // Assert
        config["DB_URL"].Should().Be(expectedValue);
    }

    [Fact]
    public void Should_ThrowFileNotFoundException_When_MapFileDoesNotExist()
    {
        // Act
        var act = () => new ConfigurationBuilder()
            .AddEnvilder("/nonexistent/secrets-map.json", _awsProvider)
            .Build();

        // Assert
        act.Should().Throw<FileNotFoundException>()
            .WithMessage("*Map file not found*");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_MapFilePathIsEmpty()
    {
        // Act
        var act = () => new ConfigurationBuilder()
            .AddEnvilder("", _awsProvider)
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
        var name = "/e2e/db3-url";
        var expectedValue = "postgres://localhost:5432/mydb3";
        await PutAwsParameterAsync(name, expectedValue);

        var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "DB_URL": "{{name}}",
                "MISSING_KEY": "/e2e/does-not-exist"
            }
            """);

        // Act
        var config = new ConfigurationBuilder()
            .AddEnvilder(mapFilePath, _awsProvider)
            .Build();

        // Assert
        config["DB_URL"].Should().Be(expectedValue);
        config["MISSING_KEY"].Should().BeNull();
    }

    [Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
    public async Task Should_ResolveSecrets_When_FacadeResolveFileCalledSync()
    {
        // Arrange
        var parameterName = "/e2e/facade-resolve";
        var expectedValue = "facade-resolve-value";
        await PutAwsParameterAsync(parameterName, expectedValue);

        var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "FACADE_RESOLVE": "{{parameterName}}"
            }
            """);

        // Act
        var actual = EnvilderFacade.ResolveFile(mapFilePath);

        // Assert
        actual["FACADE_RESOLVE"].Should().Be(expectedValue);
    }

    [Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
    public async Task Should_InjectIntoEnvironment_When_FacadeLoadCalledSync()
    {
        // Arrange
        var parameterName = "/e2e/facade-load";
        var expectedValue = "facade-load-value";
        await PutAwsParameterAsync(parameterName, expectedValue);

        var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "FACADE_LOAD": "{{parameterName}}"
            }
            """);

        // Act
        var actual = EnvilderFacade.Load(mapFilePath);

        // Assert
        actual["FACADE_LOAD"].Should().Be(expectedValue);
        Environment.GetEnvironmentVariable("FACADE_LOAD").Should().Be(expectedValue);
    }

    private async Task<string> WriteTempMapFileAsync(string json)
    {
        var path = Path.Combine(Path.GetTempPath(), $"envilder-{Guid.NewGuid():N}.json");
        await File.WriteAllTextAsync(path, json);
        _tempFiles.Add(path);

        return path;
    }

    private async Task PutAwsParameterAsync(string name, string value)
    {
        await _localStack.SsmClient.PutParameterAsync(new()
        {
            Name = name,
            Value = value,
            Type = ParameterType.SecureString,
            Overwrite = true,
        });
    }
}