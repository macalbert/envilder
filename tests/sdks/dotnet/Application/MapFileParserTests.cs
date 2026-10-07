namespace Envilder.Tests.Application;

using AwesomeAssertions;
using System.Text.Json;

public class MapFileParserTests
{
	private static readonly char[] LineTerminators = ['\r', '\n', '\u2028', '\u2029'];

	private readonly MapFileParser _sut = new();

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

		// Act
		var actual = _sut.Parse(json);

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

		// Act
		var actual = _sut.Parse(json);

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

		// Act
		var actual = _sut.Parse(json);

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

		// Act
		var actual = _sut.Parse(json);

		// Assert
		actual.Config.Provider.Should().BeNull();
		actual.Config.VaultUrl.Should().BeNull();
		actual.Config.Profile.Should().BeNull();
		actual.Mappings.Should().HaveCount(1);
		actual.Mappings["TOKEN_SECRET"].Should().Be("/Test/Token");
	}

	[Fact]
	public void Should_SkipNonStringValues_When_MapFileContainsNonStringEntries()
	{
		// Arrange
		var json = """
            {
                "TOKEN_SECRET": "/Test/Token",
                "NUMERIC_VALUE": 42,
                "NULL_VALUE": null,
                "OBJECT_VALUE": { "nested": true }
            }
            """;

		// Act
		var actual = _sut.Parse(json);

		// Assert
		actual.Mappings.Should().HaveCount(1);
		actual.Mappings["TOKEN_SECRET"].Should().Be("/Test/Token");
	}

	[Fact]
	public void Should_ExcludeDollarPrefixedKeys_When_MapFileContainsSchemaKey()
	{
		// Arrange
		var json = """
            {
                "$schema": "https://envilder.com/schema/map-file.v1.json",
                "$config": { "provider": "aws" },
                "DB_URL": "/app/db"
            }
            """;

		// Act
		var actual = _sut.Parse(json);

		// Assert
		actual.Mappings.Should().HaveCount(1);
		actual.Mappings.Should().NotContainKey("$schema");
		actual.Mappings["DB_URL"].Should().Be("/app/db");
		actual.Config.Provider.Should().Be(SecretProviderType.Aws);
	}

	[Theory]
	[InlineData("")]
	[InlineData("   ")]
	[InlineData("SAFE=prefix")]
	[InlineData("SAFE\nINJECTED")]
	[InlineData("SAFE\rINJECTED")]
	[InlineData("SAFE\u2028INJECTED")]
	[InlineData("SAFE\u2029INJECTED")]
	[InlineData("LOST NAME")]
	[InlineData("LOST\tNAME")]
	[InlineData("LOST#NAME")]
	[InlineData("SAFE\n")]
	[InlineData("SAFE\r")]
	[InlineData("SAFE\r\n")]
	[InlineData("SAFE\u2028")]
	[InlineData("SAFE\u2029")]
	[InlineData("CAFÉ_URL")]
	[InlineData("__proto__")]
	public void Should_ThrowFormatException_When_MappingNameIsInvalid(string invalidName)
	{
		// Arrange
		var json = JsonSerializer.Serialize(new Dictionary<string, string> { [invalidName] = "/app/secret" });

		// Act
		var act = () => _sut.Parse(json);

		// Assert
		act.Should().Throw<FormatException>()
			.Where(e => e.Message.Contains("environment variable name", StringComparison.OrdinalIgnoreCase))
			.Where(e => e.Message.IndexOfAny(LineTerminators) < 0);
	}

	[Fact]
	public void Should_ThrowFormatException_When_InvalidNameMapsToNonStringValue()
	{
		// Arrange
		var json = """{ "SAFE=prefix": 42 }""";

		// Act
		var act = () => _sut.Parse(json);

		// Assert
		act.Should().Throw<FormatException>()
			.WithMessage("*environment variable name*");
	}

	[Fact]
	public void Should_AcceptMappings_When_NamesAreDottedHyphenatedOrStartWithDigit()
	{
		// Arrange
		var expected = new Dictionary<string, string>
		{
			["APP.NAME"] = "/app/name",
			["APP-NAME"] = "/app/name-hyphen",
			["1PASSWORD_TOKEN"] = "/app/token",
			["__proto__x"] = "/app/proto-like",
		};
		var json = JsonSerializer.Serialize(expected);

		// Act
		var actual = _sut.Parse(json);

		// Assert
		actual.Mappings.Should().BeEquivalentTo(expected);
	}
}