namespace Envilder.Tests.EndToEnd;

using Amazon.SimpleSystemsManagement;
using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure;
using Envilder.Infrastructure.Configuration;
using Envilder.Infrastructure.DependencyInjection;
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

	private readonly List<string> _tempFiles = [];

	private static readonly string[] FacadeEnvVars =
	[
		"AWS_ENDPOINT_URL", "AWS_SERVICE_URL",
		"AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_DEFAULT_REGION",
		"FACADE_RESOLVE", "FACADE_LOAD",
		"FACADE_RESOLVE_ASYNC", "FACADE_LOAD_ASYNC",
		"BUILDER_RESOLVE", "BUILDER_INJECT",
		"BUILDER_RESOLVE_ASYNC", "BUILDER_INJECT_ASYNC",
		"ENV_ROUTE_RESOLVE", "ENV_ROUTE_LOAD",
		"DI_RESOLVE",
	];

	private (string Name, string? Value)[] _originalEnvValues = [];

	public ConsumerExperienceTests(LocalStackFixture localStack,
								   LowkeyVaultFixture lowkeyVault)
	{
		_localStack = localStack;
		_lowkeyVault = lowkeyVault;
	}

	public ValueTask InitializeAsync()
	{
		_originalEnvValues = FacadeEnvVars
			.Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
			.ToArray();

		Environment.SetEnvironmentVariable("AWS_ENDPOINT_URL", _localStack.ServiceUrl);
		Environment.SetEnvironmentVariable("AWS_SERVICE_URL", _localStack.ServiceUrl);
		Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", "test");
		Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", "test");
		Environment.SetEnvironmentVariable("AWS_DEFAULT_REGION", "us-east-1");

		return ValueTask.CompletedTask;
	}

	public ValueTask DisposeAsync()
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

		return ValueTask.CompletedTask;
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
			.AddEnvilder(mapFilePath)
			.Build();

		// Assert
		actual["DB_URL"].Should().Be(expectedConnectionString);
		actual["API_KEY"].Should().Be(expectedApikey);
	}

	[Fact]
	public async Task Should_ExposeAwsSecretsViaIConfiguration_When_OptionsOverrideMapFileConfig()
	{
		// Arrange
		var connectionStringName = "/e2e/db2-url";
		var expectedConnectionString = "postgres://localhost:5432/mydb2";
		await PutAwsParameterAsync(connectionStringName, expectedConnectionString);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws", "profile": "nonexistent" },
                "DB_URL": "{{connectionStringName}}"
            }
            """);

		// Act
		var config = new ConfigurationBuilder()
			.AddEnvilder(mapFilePath, new EnvilderOptions { Profile = "" })
			.Build();

		// Assert
		config["DB_URL"].Should().Be(expectedConnectionString);
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
		builder.Configuration.AddEnvilder(mapFilePath);
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
			.AddEnvilder("/nonexistent/secrets-map.json")
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
			.AddEnvilder(string.Empty)
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
			.AddEnvilder(mapFilePath)
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

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ResolveSecrets_When_FacadeResolveFileAsyncCalled()
	{
		// Arrange
		var parameterName = "/e2e/facade-resolve-async";
		var expectedValue = "facade-resolve-async-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "FACADE_RESOLVE_ASYNC": "{{parameterName}}"
            }
            """);

		// Act
		var actual = await EnvilderFacade.ResolveFileAsync(mapFilePath);

		// Assert
		actual["FACADE_RESOLVE_ASYNC"].Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_InjectIntoEnvironment_When_FacadeLoadAsyncCalled()
	{
		// Arrange
		var parameterName = "/e2e/facade-load-async";
		var expectedValue = "facade-load-async-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "FACADE_LOAD_ASYNC": "{{parameterName}}"
            }
            """);

		// Act
		var actual = await EnvilderFacade.LoadAsync(mapFilePath);

		// Assert
		actual["FACADE_LOAD_ASYNC"].Should().Be(expectedValue);
		Environment.GetEnvironmentVariable("FACADE_LOAD_ASYNC").Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ResolveSecrets_When_BuilderResolveCalledSync()
	{
		// Arrange
		var parameterName = "/e2e/builder-resolve";
		var expectedValue = "builder-resolve-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "BUILDER_RESOLVE": "{{parameterName}}"
            }
            """);

		// Act
		var actual = EnvilderFacade.FromMapFile(mapFilePath).Resolve();

		// Assert
		actual["BUILDER_RESOLVE"].Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_InjectIntoEnvironment_When_BuilderInjectCalledSync()
	{
		// Arrange
		var parameterName = "/e2e/builder-inject";
		var expectedValue = "builder-inject-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "BUILDER_INJECT": "{{parameterName}}"
            }
            """);

		// Act
		var actual = EnvilderFacade.FromMapFile(mapFilePath).Inject();

		// Assert
		actual["BUILDER_INJECT"].Should().Be(expectedValue);
		Environment.GetEnvironmentVariable("BUILDER_INJECT").Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ResolveSecrets_When_BuilderResolveAsyncCalled()
	{
		// Arrange
		var parameterName = "/e2e/builder-resolve-async";
		var expectedValue = "builder-resolve-async-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "BUILDER_RESOLVE_ASYNC": "{{parameterName}}"
            }
            """);

		// Act
		var actual = await EnvilderFacade.FromMapFile(mapFilePath).ResolveAsync();

		// Assert
		actual["BUILDER_RESOLVE_ASYNC"].Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_InjectIntoEnvironment_When_BuilderInjectAsyncCalled()
	{
		// Arrange
		var parameterName = "/e2e/builder-inject-async";
		var expectedValue = "builder-inject-async-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "BUILDER_INJECT_ASYNC": "{{parameterName}}"
            }
            """);

		// Act
		var actual = await EnvilderFacade.FromMapFile(mapFilePath).InjectAsync();

		// Assert
		actual["BUILDER_INJECT_ASYNC"].Should().Be(expectedValue);
		Environment.GetEnvironmentVariable("BUILDER_INJECT_ASYNC").Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ResolveSecrets_When_EnvRoutingResolveFileUsed()
	{
		// Arrange
		var parameterName = "/e2e/env-route-resolve";
		var expectedValue = "env-route-resolve-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "ENV_ROUTE_RESOLVE": "{{parameterName}}"
            }
            """);

		var envMapping = new Dictionary<string, string?>
		{
			["production"] = mapFilePath,
			["test"] = null,
		};

		// Act
		var actual = EnvilderFacade.ResolveFile("production", envMapping);

		// Assert
		actual["ENV_ROUTE_RESOLVE"].Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_InjectIntoEnvironment_When_EnvRoutingLoadUsed()
	{
		// Arrange
		var parameterName = "/e2e/env-route-load";
		var expectedValue = "env-route-load-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "ENV_ROUTE_LOAD": "{{parameterName}}"
            }
            """);

		var envMapping = new Dictionary<string, string?>
		{
			["production"] = mapFilePath,
			["test"] = null,
		};

		// Act
		var actual = EnvilderFacade.Load("production", envMapping);

		// Assert
		actual["ENV_ROUTE_LOAD"].Should().Be(expectedValue);
		Environment.GetEnvironmentVariable("ENV_ROUTE_LOAD").Should().Be(expectedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_PassValidation_When_AllSecretsResolved()
	{
		// Arrange
		var parameterName = "/e2e/validate-ok";
		var expectedValue = "validate-ok-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "VALIDATE_OK": "{{parameterName}}"
            }
            """);

		// Act
		var secrets = EnvilderFacade.ResolveFile(mapFilePath);
		var act = () => secrets.ValidateSecrets();

		// Assert
		act.Should().NotThrow();
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ResolveSecrets_When_ServiceCollectionAddEnvilderUsed()
	{
		// Arrange
		var parameterName = "/e2e/di-resolve";
		var expectedValue = "di-resolve-value";
		await PutAwsParameterAsync(parameterName, expectedValue);

		var mapFilePath = await WriteTempMapFileAsync($$"""
            {
                "$config": { "provider": "aws" },
                "DI_RESOLVE": "{{parameterName}}"
            }
            """);

		var services = new ServiceCollection();
		services.AddEnvilder(mapFilePath);
		using var provider = services.BuildServiceProvider();

		var client = provider.GetRequiredService<EnvilderClient>();
		var mapFile = provider.GetRequiredService<ParsedMapFile>();

		// Act
		var actual = client.ResolveSecrets(mapFile);

		// Assert
		actual["DI_RESOLVE"].Should().Be(expectedValue);
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