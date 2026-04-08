namespace Envilder.Tests.Infrastructure;

using AwesomeAssertions;
using Envilder.Domain;
using Envilder.Infrastructure;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;

public class SecretProviderFactoryTests
{
    [Fact]
    public void Should_SelectAwsProvider_When_NoProviderSpecified()
    {
        // Arrange
        var config = new MapFileConfig();

        // Act
        var actual = SecretProviderFactory.Create(config);

        // Assert
        actual.Should().BeOfType<AwsSsmSecretProvider>();
    }

    [Fact]
    public void Should_SelectAzureProvider_When_ConfigSpecifiesAzure()
    {
        // Arrange
        var config = new MapFileConfig
        {
            Provider = SecretProviderType.Azure,
            VaultUrl = "https://my-vault.vault.azure.net",
        };

        // Act
        var actual = SecretProviderFactory.Create(config);

        // Assert
        actual.Should().BeOfType<AzureKeyVaultSecretProvider>();
    }

    [Fact]
    public void Should_OverrideConfigWithOptions_When_BothProvided()
    {
        // Arrange
        var config = new MapFileConfig { Provider = SecretProviderType.Aws };
        var options = new EnvilderOptions
        {
            Provider = SecretProviderType.Azure,
            VaultUrl = "https://override-vault.vault.azure.net",
        };

        // Act
        var actual = SecretProviderFactory.Create(config, options);

        // Assert
        actual.Should().BeOfType<AzureKeyVaultSecretProvider>();
    }

    [Fact]
    public void Should_RequireVaultUrl_When_AzureProviderSelected()
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
    public void Should_ThrowArgumentNullException_When_ConfigIsNull()
    {
        // Act
        var act = () => SecretProviderFactory.Create(null!);

        // Assert
        act.Should().Throw<ArgumentNullException>()
            .And.ParamName.Should().Be("config");
    }

    [Fact]
    public void Should_ThrowInvalidOperationException_When_AwsProfileNotFound()
    {
        // Arrange
        var config = new MapFileConfig
        {
            Provider = SecretProviderType.Aws,
            Profile = "nonexistent-profile-12345",
        };

        // Act
        var act = () => SecretProviderFactory.Create(config);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*profile*nonexistent-profile-12345*");
    }

    [Fact]
    public void Should_SelectAwsProvider_When_NoAwsRegionConfigured()
    {
        // Arrange
        var envVarsToOverride = new[]
        {
            "AWS_DEFAULT_REGION", "AWS_REGION", "AWS_PROFILE",
            "AWS_CONFIG_FILE", "AWS_SHARED_CREDENTIALS_FILE",
            "USERPROFILE", "HOME",
        };
        var originalValues = envVarsToOverride
            .Select(v => (Name: v, Value: Environment.GetEnvironmentVariable(v)))
            .ToArray();
        var emptyDir = Path.Combine(Path.GetTempPath(), $"envilder-test-{Guid.NewGuid()}");
        Directory.CreateDirectory(emptyDir);

        try
        {
            Environment.SetEnvironmentVariable("AWS_DEFAULT_REGION", null);
            Environment.SetEnvironmentVariable("AWS_REGION", null);
            Environment.SetEnvironmentVariable("AWS_PROFILE", null);
            Environment.SetEnvironmentVariable("AWS_CONFIG_FILE", Path.Combine(emptyDir, "config"));
            Environment.SetEnvironmentVariable("AWS_SHARED_CREDENTIALS_FILE", Path.Combine(emptyDir, "credentials"));
            Environment.SetEnvironmentVariable("USERPROFILE", emptyDir);
            Environment.SetEnvironmentVariable("HOME", emptyDir);

            var config = new MapFileConfig();

            // Act
            var act = () => SecretProviderFactory.Create(config);

            // Assert
            act.Should().NotThrow();
        }
        finally
        {
            foreach (var (name, value) in originalValues)
            {
                Environment.SetEnvironmentVariable(name, value);
            }

            Directory.Delete(emptyDir, true);
        }
    }
}