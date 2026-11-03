namespace Envilder.Tests.Application;

using AwesomeAssertions;

public class MapFileValidatorTests
{
	private static IReadOnlyList<MapFileError> Validate(string json, EnvilderOptions? overrides = null)
	{
		return MapFileValidator.ValidateContent(json, overrides ?? new());
	}

	[Fact]
	public void Should_ReturnNoErrors_When_MapFileIsValidAwsFile()
	{
		// Arrange
		var json = """{"$config":{"provider":"aws","profile":"dev"},"DB_URL":"/app/db"}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().BeEmpty();
	}

	[Fact]
	public void Should_ReturnNoErrors_When_AzureFileHasVaultUrl()
	{
		// Arrange
		var json = """{"$config":{"provider":"azure","vaultUrl":"https://v.vault.azure.net"},"A":"a"}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().BeEmpty();
	}

	[Fact]
	public void Should_ReturnNoErrors_When_SchemaAndOptionalFieldsAreValid()
	{
		// Arrange
		var json = """{"$schema":"https://envilder.com/schema.json","$config":{"name":"x","owner":"y"},"A":"a"}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().BeEmpty();
	}

	[Fact]
	public void Should_ReportRootError_When_JsonIsInvalid()
	{
		// Arrange
		var json = """{"DB_URL": "super-secret-value" """;

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle()
			.Which.Should().BeEquivalentTo(new MapFileError("(root)", "The map file is not valid JSON."));
	}

	[Theory]
	[InlineData("[]")]
	[InlineData("\"text\"")]
	[InlineData("null")]
	public void Should_ReportRootError_When_RootIsNotAnObject(string json)
	{
		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle()
			.Which.Should().BeEquivalentTo(new MapFileError("(root)", "The map file must be a JSON object."));
	}

	[Fact]
	public void Should_ReportInvalidName_When_VariableNameIsOutsideTheGrammar()
	{
		// Arrange
		var json = """{"BAD NAME":"/app/x"}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle()
			.Which.Message.Should().Be(
				"Invalid environment variable name \"BAD NAME\": names may only contain letters, digits, "
				+ "underscore, dot, hyphen and slash, so that they can be read back from a .env file.");
	}

	[Theory]
	[InlineData("""{"A":1}""", "A must map to a string secret path, not a number.")]
	[InlineData("""{"A":true}""", "A must map to a string secret path, not a boolean.")]
	[InlineData("""{"A":null}""", "A must map to a string secret path, not null.")]
	[InlineData("""{"A":["x"]}""", "A must map to a string secret path, not an array.")]
	[InlineData("""{"A":{"x":"y"}}""", "A must map to a string secret path, not an object.")]
	public void Should_ReportTypeOnly_When_MappingIsNotAString(string json, string expected)
	{
		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle().Which.Message.Should().Be(expected);
	}

	[Fact]
	public void Should_ReportReservedKey_When_UnknownDollarKeyIsPresent()
	{
		// Arrange
		var json = """{"$other":"x"}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle().Which.Message
			.Should().Be("$other is reserved: only $schema and $config may start with \"$\".");
	}

	[Fact]
	public void Should_ReportConfigError_When_ConfigIsNotAnObject()
	{
		// Arrange
		var json = """{"$config":"aws"}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle()
			.Which.Should().BeEquivalentTo(new MapFileError("$config", "$config must be an object."));
	}

	[Fact]
	public void Should_ReportUnknownField_When_ConfigHasUnknownField()
	{
		// Arrange
		var json = """{"$config":{"colour":"red"}}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle().Which.Message.Should().Be(
			"$config.colour is not a known field. Allowed fields: provider, profile, vaultUrl, projectId, "
			+ "namespace, path, name, description, owner, environment.");
	}

	[Fact]
	public void Should_ReportTypeError_When_ConfigFieldIsNotAString()
	{
		// Arrange
		var json = """{"$config":{"profile":5}}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle().Which.Should().BeEquivalentTo(
			new MapFileError("$config.profile", "$config.profile must be a string, not a number."));
	}

	[Theory]
	[InlineData("""{"$schema":"not a uri"}""", "$schema")]
	[InlineData("""{"$schema":"/relative/path"}""", "$schema")]
	[InlineData("""{"$config":{"provider":"azure","vaultUrl":"vault"}}""", "$config.vaultUrl")]
	public void Should_ReportUriError_When_ValueIsNotAnAbsoluteUri(string json, string key)
	{
		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle()
			.Which.Should().BeEquivalentTo(new MapFileError(key, $"{key} must be an absolute URI."));
	}

	[Theory]
	[InlineData("gcp")]
	[InlineData("hashicorp")]
	[InlineData("file")]
	public void Should_ReportUnsupportedProvider_When_ProviderIsNotAwsOrAzure(string provider)
	{
		// Arrange
		var json = $$$"""{"$config":{"provider":"{{{provider}}}"}}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle()
			.Which.Should().BeEquivalentTo(new MapFileError(
				"$config.provider",
				$"Unsupported provider: {provider}. Supported providers: aws, azure."));
	}

	[Fact]
	public void Should_ReportProfileOnlyForAws_When_AzureFileSetsProfile()
	{
		// Arrange
		var json = """{"$config":{"provider":"azure","vaultUrl":"https://v.vault.azure.net","profile":"dev"}}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle().Which.Should().BeEquivalentTo(new MapFileError(
			"$config.profile",
			"$config.profile is only supported with the aws provider (current provider: azure)."));
	}

	[Fact]
	public void Should_ReportVaultUrlOnlyForAzure_When_AwsFileSetsVaultUrl()
	{
		// Arrange
		var json = """{"$config":{"vaultUrl":"https://v.vault.azure.net"}}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle().Which.Should().BeEquivalentTo(new MapFileError(
			"$config.vaultUrl",
			"$config.vaultUrl is only supported with the azure provider (current provider: aws)."));
	}

	[Fact]
	public void Should_ReportVaultUrlRequired_When_AzureFileHasNoVaultUrl()
	{
		// Arrange
		var json = """{"$config":{"provider":"azure"}}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Should().ContainSingle().Which.Should().BeEquivalentTo(new MapFileError(
			"$config.vaultUrl",
			"vaultUrl is required when using Azure provider. "
			+ "Set it in $config.vaultUrl in your map file or via WithVaultUrl()."));
	}

	[Fact]
	public void Should_ReportNoErrors_When_OverrideSuppliesVaultUrl()
	{
		// Arrange
		var json = """{"$config":{"provider":"azure"}}""";
		var overrides = new EnvilderOptions { VaultUrl = "https://v.vault.azure.net" };

		// Act
		var actual = Validate(json, overrides);

		// Assert
		actual.Should().BeEmpty();
	}

	[Fact]
	public void Should_UseOverrideProvider_When_OverrideProviderConflictsWithFileProfile()
	{
		// Arrange
		var json = """{"$config":{"profile":"dev"},"A":"/a"}""";
		var overrides = new EnvilderOptions
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "https://v.vault.azure.net",
		};

		// Act
		var actual = Validate(json, overrides);

		// Assert
		actual.Should().ContainSingle().Which.Should().BeEquivalentTo(new MapFileError(
			"$config.profile",
			"$config.profile is only supported with the aws provider (current provider: azure)."));
	}

	[Fact]
	public void Should_NameOverrideMethod_When_OverrideProfileConflictsWithAzure()
	{
		// Arrange
		var json = """{"$config":{"provider":"azure","vaultUrl":"https://v.vault.azure.net"}}""";
		var overrides = new EnvilderOptions { Profile = "dev" };

		// Act
		var actual = Validate(json, overrides);

		// Assert
		actual.Should().ContainSingle().Which.Should().BeEquivalentTo(new MapFileError(
			"WithProfile()",
			"WithProfile() is only supported with the aws provider (current provider: azure)."));
	}

	[Fact]
	public void Should_IgnoreBlankOverrides_When_OverridesAreWhitespace()
	{
		// Arrange
		var json = """{"$config":{"provider":"aws","profile":"dev"},"A":"/a"}""";
		var overrides = new EnvilderOptions { Profile = "  ", VaultUrl = " " };

		// Act
		var actual = Validate(json, overrides);

		// Assert
		actual.Should().BeEmpty();
	}

	[Fact]
	public void Should_QuoteKey_When_KeyContainsLineBreak()
	{
		// Arrange
		var json = "{\"A\\nB\":1}";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Select(error => error.Message).Should().OnlyContain(message => !message.Contains('\n'));
	}

	[Fact]
	public void Should_NeverEchoMappedValue_When_ValueIsNotAString()
	{
		// Arrange
		var json = """{"A":{"password":"leaked-secret-123"}}""";

		// Act
		var actual = Validate(json);

		// Assert
		actual.Select(error => error.Key + error.Message)
			.Should().NotContain(text => text.Contains("leaked-secret-123"));
	}
}