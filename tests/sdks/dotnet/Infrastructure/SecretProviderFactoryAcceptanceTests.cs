namespace Envilder.Tests.Infrastructure;

using Amazon.SimpleSystemsManagement;
using AwesomeAssertions;
using Envilder.Domain;
using Envilder.Infrastructure;
using Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class SecretProviderFactoryAcceptanceTests
{
    private readonly LocalStackFixture _localStack;

    public SecretProviderFactoryAcceptanceTests(LocalStackFixture localStack)
    {
        _localStack = localStack;
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

        var envVarsToOverride = new[]
        {
            "AWS_ENDPOINT_URL", "AWS_SERVICE_URL",
            "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY",
            "AWS_DEFAULT_REGION", "AWS_REGION",
        };
        var originalValues = envVarsToOverride
            .Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
            .ToArray();

        try
        {
            Environment.SetEnvironmentVariable("AWS_ENDPOINT_URL", _localStack.ServiceUrl);
            Environment.SetEnvironmentVariable("AWS_SERVICE_URL", _localStack.ServiceUrl);
            Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", "test");
            Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", "test");
            Environment.SetEnvironmentVariable("AWS_DEFAULT_REGION", "us-east-1");

            var config = new MapFileConfig { Provider = SecretProviderType.Aws };
            var sut = SecretProviderFactory.Create(config);

            // Act
            var actual = await sut.GetSecretAsync("/Test/FactoryNoProfile");

            // Assert
            actual.Should().Be("factory-no-profile-secret");
        }
        finally
        {
            foreach (var (name, value) in originalValues)
            {
                Environment.SetEnvironmentVariable(name, value);
            }
        }
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

        var tempDir = Path.Combine(Path.GetTempPath(), $"envilder-test-{Guid.NewGuid()}");
        Directory.CreateDirectory(tempDir);

        var configFilePath = Path.Combine(tempDir, "config");
        var credentialsFilePath = Path.Combine(tempDir, "credentials");

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

        var envVarsToOverride = new[]
        {
            "AWS_CONFIG_FILE", "AWS_SHARED_CREDENTIALS_FILE",
            "AWS_ENDPOINT_URL", "AWS_ACCESS_KEY_ID",
            "AWS_SECRET_ACCESS_KEY", "AWS_DEFAULT_REGION",
            "AWS_REGION", "AWS_PROFILE",
        };
        var originalValues = envVarsToOverride
            .Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
            .ToArray();

        try
        {
            Environment.SetEnvironmentVariable("AWS_CONFIG_FILE", configFilePath);
            Environment.SetEnvironmentVariable("AWS_SHARED_CREDENTIALS_FILE", credentialsFilePath);
            Environment.SetEnvironmentVariable("AWS_ENDPOINT_URL", _localStack.ServiceUrl);
            Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", null);
            Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", null);
            Environment.SetEnvironmentVariable("AWS_DEFAULT_REGION", null);
            Environment.SetEnvironmentVariable("AWS_REGION", null);
            Environment.SetEnvironmentVariable("AWS_PROFILE", null);

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
        finally
        {
            foreach (var (name, value) in originalValues)
            {
                Environment.SetEnvironmentVariable(name, value);
            }

            Directory.Delete(tempDir, true);
        }
    }
}
