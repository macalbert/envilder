namespace Envilder.Tests.Application;

using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
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
        act.Should().Throw<InvalidOperationException>();
    }
}