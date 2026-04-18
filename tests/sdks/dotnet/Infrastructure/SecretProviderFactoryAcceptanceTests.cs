namespace Envilder.Tests.Infrastructure;

using Amazon.SimpleSystemsManagement;
using AwesomeAssertions;
using Envilder.Domain;
using Envilder.Infrastructure;
using Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class SecretProviderFactoryAcceptanceTests : IAsyncLifetime
{
    private readonly LocalStackFixture _localStack;
    private readonly List<(string Name, string? Value)> _savedEnvVars = [];
    private string? _tempDirToDelete;

    public SecretProviderFactoryAcceptanceTests(LocalStackFixture localStack)
    {
        _localStack = localStack;
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public Task DisposeAsync()
    {
        foreach (var (name, value) in _savedEnvVars)
        {
            Environment.SetEnvironmentVariable(name, value);
        }

        if (_tempDirToDelete is not null)
        {
            Directory.Delete(_tempDirToDelete, true);
        }

        return Task.CompletedTask;
    }

    [Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
    public async Task Should_ResolveSecret_When_FactoryCreatesProviderWithoutProfile()
    {
        // Arrange
        await _localStack.SsmClient.PutParameterAsync(new()
        {
            Name = "/Test/FactoryNoProfile",
            Value = "factory-no-profile-secret",
            Type = ParameterType.SecureString,
            Overwrite = true,
        });

        OverrideEnvironmentVariable("AWS_ENDPOINT_URL", _localStack.ServiceUrl);
        OverrideEnvironmentVariable("AWS_SERVICE_URL", _localStack.ServiceUrl);
        OverrideEnvironmentVariable("AWS_ACCESS_KEY_ID", "test");
        OverrideEnvironmentVariable("AWS_SECRET_ACCESS_KEY", "test");
        OverrideEnvironmentVariable("AWS_DEFAULT_REGION", "us-east-1");
        OverrideEnvironmentVariable("AWS_REGION", null);
        OverrideEnvironmentVariable("AWS_PROFILE", null);

        var config = new MapFileConfig { Provider = SecretProviderType.Aws };
        var sut = SecretProviderFactory.Create(config);

        // Act
        var actual = await sut.GetSecretAsync("/Test/FactoryNoProfile");

        // Assert
        actual.Should().Be("factory-no-profile-secret");
    }

    [Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
    public async Task Should_ResolveSecret_When_FactoryCreatesProviderWithProfile()
    {
        // Arrange
        await _localStack.SsmClient.PutParameterAsync(new()
        {
            Name = "/Test/FactoryWithProfile",
            Value = "factory-profile-secret",
            Type = ParameterType.SecureString,
            Overwrite = true,
        });

        _tempDirToDelete = Path.Combine(Path.GetTempPath(), $"envilder-test-{Guid.NewGuid()}");
        Directory.CreateDirectory(_tempDirToDelete);

        var configFilePath = Path.Combine(_tempDirToDelete, "config");
        var credentialsFilePath = Path.Combine(_tempDirToDelete, "credentials");

        await File.WriteAllTextAsync(configFilePath,
            $"""
            [profile localstack-test]
            region = us-east-1
            endpoint_url = {_localStack.ServiceUrl}
            """);

        await File.WriteAllTextAsync(credentialsFilePath,
            """
            [localstack-test]
            aws_access_key_id = test
            aws_secret_access_key = test
            """);

        OverrideEnvironmentVariable("AWS_CONFIG_FILE", configFilePath);
        OverrideEnvironmentVariable("AWS_SHARED_CREDENTIALS_FILE", credentialsFilePath);
        OverrideEnvironmentVariable("AWS_ENDPOINT_URL", _localStack.ServiceUrl);
        OverrideEnvironmentVariable("AWS_ACCESS_KEY_ID", null);
        OverrideEnvironmentVariable("AWS_SECRET_ACCESS_KEY", null);
        OverrideEnvironmentVariable("AWS_DEFAULT_REGION", null);
        OverrideEnvironmentVariable("AWS_REGION", null);
        OverrideEnvironmentVariable("AWS_PROFILE", null);

        var config = new MapFileConfig
        {
            Provider = SecretProviderType.Aws,
            Profile = "localstack-test",
        };
        var sut = SecretProviderFactory.Create(config);

        // Act
        var actual = await sut.GetSecretAsync("/Test/FactoryWithProfile");

        // Assert
        actual.Should().Be("factory-profile-secret");
    }

    private void OverrideEnvironmentVariable(string name, string? value)
    {
        _savedEnvVars.Add((name, Environment.GetEnvironmentVariable(name)));
        Environment.SetEnvironmentVariable(name, value);
    }
}
