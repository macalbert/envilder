using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Infrastructure;

namespace Envilder.Tests.Application;

public class SecretProviderFactoryTests
{
    [Fact]
    public void Should_SelectAwsProvider_When_NoProviderSpecified()
    {
        // Arrange
        var config = new MapFileConfig();
        var sut = new SecretProviderFactory();

        // Act
        var actual = sut.Create(config);

        // Assert
        actual.Should().BeOfType<AwsSsmSecretProvider>();
    }

    [Fact]
    public void Should_SelectAzureProvider_When_ConfigSpecifiesAzure()
    {
        // Arrange
        var config = new MapFileConfig
        {
            Provider = "azure",
            VaultUrl = "https://my-vault.vault.azure.net",
        };
        var sut = new SecretProviderFactory();

        // Act
        var actual = sut.Create(config);

        // Assert
        actual.Should().BeOfType<AzureKeyVaultSecretProvider>();
    }

    [Fact]
    public void Should_OverrideConfigWithOptions_When_BothProvided()
    {
        // Arrange
        var config = new MapFileConfig { Provider = "aws" };
        var options = new EnvilderOptions
        {
            Provider = "azure",
            VaultUrl = "https://override-vault.vault.azure.net",
        };
        var sut = new SecretProviderFactory();

        // Act
        var actual = sut.Create(config, options);

        // Assert
        actual.Should().BeOfType<AzureKeyVaultSecretProvider>();
    }

    [Fact]
    public void Should_RequireVaultUrl_When_AzureProviderSelected()
    {
        // Arrange
        var config = new MapFileConfig { Provider = "azure" };
        var sut = new SecretProviderFactory();

        // Act
        var act = () => sut.Create(config);

        // Assert
        act.Should().Throw<InvalidOperationException>();
    }
}
