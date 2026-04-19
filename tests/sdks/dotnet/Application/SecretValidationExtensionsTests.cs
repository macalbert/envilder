namespace Envilder.Tests.Application;

using AwesomeAssertions;
using Envilder.Application;

public class SecretValidationExtensionsTests
{
	[Fact]
	public void Should_NotThrow_When_AllValuesArePresent()
	{
		// Arrange
		var secrets = new Dictionary<string, string>
		{
			["DB_URL"] = "postgres://localhost",
			["API_KEY"] = "sk-123",
		} as IReadOnlyDictionary<string, string>;

		// Act
		var act = () => secrets.ValidateSecrets();

		// Assert
		act.Should().NotThrow();
	}

	[Fact]
	public void Should_Throw_When_AnyValueIsEmpty()
	{
		// Arrange
		var secrets = new Dictionary<string, string>
		{
			["DB_URL"] = "postgres://localhost",
			["API_KEY"] = "",
		} as IReadOnlyDictionary<string, string>;

		// Act
		var act = () => secrets.ValidateSecrets();

		// Assert
		act.Should().Throw<SecretValidationException>()
			.Which.MissingKeys.Should().ContainSingle()
			.Which.Should().Be("API_KEY");
	}

	[Fact]
	public void Should_Throw_When_DictionaryIsEmpty()
	{
		// Arrange
		var secrets = new Dictionary<string, string>() as IReadOnlyDictionary<string, string>;

		// Act
		var act = () => secrets.ValidateSecrets();

		// Assert
		act.Should().Throw<SecretValidationException>()
			.Which.MissingKeys.Should().BeEmpty();
	}

	[Fact]
	public void Should_Throw_When_MultipleValuesAreEmptyOrWhitespace()
	{
		// Arrange
		var secrets = new Dictionary<string, string>
		{
			["DB_URL"] = "postgres://localhost",
			["API_KEY"] = "",
			["SECRET"] = "   ",
		} as IReadOnlyDictionary<string, string>;

		// Act
		var act = () => secrets.ValidateSecrets();

		// Assert
		act.Should().Throw<SecretValidationException>()
			.Which.MissingKeys.Should().HaveCount(2)
			.And.Contain("API_KEY")
			.And.Contain("SECRET");
	}

	[Fact]
	public void Should_IncludeKeyNamesInMessage_When_ValidationFails()
	{
		// Arrange
		var secrets = new Dictionary<string, string>
		{
			["MY_TOKEN"] = "",
		} as IReadOnlyDictionary<string, string>;

		// Act
		var act = () => secrets.ValidateSecrets();

		// Assert
		act.Should().Throw<SecretValidationException>()
			.Which.Message.Should().Contain("MY_TOKEN");
	}

	[Fact]
	public void Should_ThrowArgumentNullException_When_SecretsIsNull()
	{
		// Arrange
		IReadOnlyDictionary<string, string>? secrets = null;

		// Act
		var act = () => secrets!.ValidateSecrets();

		// Assert
		act.Should().Throw<ArgumentNullException>();
	}
}