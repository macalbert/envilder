namespace Envilder.Tests.Application;

using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;

public class MapFileParserTests
{
    [Fact]
    public void Should_ParseMappings_When_MapFileHasNoConfig()
    {
        // Arrange
        var json = """
            {
                "TOKEN_SECRET": "/Test/Token",
                "DB_PASSWORD": "/App/DbPassword"
            }
            """;
        var sut = new MapFileParser();

        // Act
        var actual = sut.Parse(json);

        // Assert
        actual.Config.Provider.Should().BeNull();
        actual.Config.VaultUrl.Should().BeNull();
        actual.Config.Profile.Should().BeNull();
        actual.Mappings.Should().HaveCount(2);
        actual.Mappings["TOKEN_SECRET"].Should().Be("/Test/Token");
        actual.Mappings["DB_PASSWORD"].Should().Be("/App/DbPassword");
    }

    [Fact]
    public void Should_ParseConfigAndMappings_When_MapFileHasAwsConfig()
    {
        // Arrange
        var json = """
            {
                "$config": {
                    "provider": "aws"
                },
                "TOKEN_SECRET": "/Test/Token"
            }
            """;
        var sut = new MapFileParser();

        // Act
        var actual = sut.Parse(json);

        // Assert
        actual.Config.Provider.Should().Be(SecretProviderType.Aws);
        actual.Config.VaultUrl.Should().BeNull();
        actual.Config.Profile.Should().BeNull();
        actual.Mappings.Should().HaveCount(1);
        actual.Mappings["TOKEN_SECRET"].Should().Be("/Test/Token");
    }

    [Fact]
    public void Should_ParseConfigAndMappings_When_MapFileHasAzureConfig()
    {
        // Arrange
        var json = """
            {
                "$config": {
                    "provider": "azure",
                    "vaultUrl": "https://my-vault.vault.azure.net"
                },
                "TOKEN_SECRET": "test-secret"
            }
            """;
        var sut = new MapFileParser();

        // Act
        var actual = sut.Parse(json);

        // Assert
        actual.Config.Provider.Should().Be(SecretProviderType.Azure);
        actual.Config.VaultUrl.Should().Be("https://my-vault.vault.azure.net");
        actual.Config.Profile.Should().BeNull();
        actual.Mappings.Should().HaveCount(1);
        actual.Mappings["TOKEN_SECRET"].Should().Be("test-secret");
    }

    [Fact]
    public void Should_DefaultToEmptyConfig_When_ConfigSectionIsInvalid()
    {
        // Arrange
        var json = """
            {
                "$config": "invalid",
                "TOKEN_SECRET": "/Test/Token"
            }
            """;
        var sut = new MapFileParser();

        // Act
        var actual = sut.Parse(json);

        // Assert
        actual.Config.Provider.Should().BeNull();
        actual.Config.VaultUrl.Should().BeNull();
        actual.Config.Profile.Should().BeNull();
        actual.Mappings.Should().HaveCount(1);
        actual.Mappings["TOKEN_SECRET"].Should().Be("/Test/Token");
    }
}
