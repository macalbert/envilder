namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using global::Envilder.Infrastructure.Azure;

// The same cases are pinned in the CLI, Node.js and Python tests: every
// surface must resolve a map-file reference to the same Key Vault secret.
public class AzureSecretNameTests
{
	[Theory]
	[InlineData("MY-SECRET-NAME")]
	[InlineData("Database--Password")]
	[InlineData("1password-token")]
	[InlineData("-edge-hyphens-")]
	public void Should_KeepNameAsWritten_When_NameIsValidForAzure(string name)
	{
		// Act
		var actual = AzureSecretName.From(name);

		// Assert
		actual.Should().Be(name);
	}

	[Fact]
	public void Should_KeepNameAsWritten_When_NameHasMaximumLength()
	{
		// Arrange
		var name = new string('a', 127);

		// Act
		var actual = AzureSecretName.From(name);

		// Assert
		actual.Should().Be(name);
	}

	[Theory]
	[InlineData("/myapp/db_password", "myapp-db-password")]
	[InlineData("/MY/SECRET_NAME", "my-secret-name")]
	[InlineData("db__url", "db-url")]
	[InlineData("/123/test", "secret-123-test")]
	[InlineData("/", "secret")]
	public void Should_NormalizeLikeTheCli_When_NameIsInvalidForAzure(string name, string expected)
	{
		// Act
		var actual = AzureSecretName.From(name);

		// Assert
		actual.Should().Be(expected);
	}

	[Theory]
	[InlineData("db.url")]
	[InlineData("db url")]
	[InlineData("db:url")]
	[InlineData("db-url\n")]
	public void Should_Throw_When_NameHasCharactersAzureCannotHold(string name)
	{
		// Act
		var act = () => AzureSecretName.From(name);

		// Assert
		act.Should().Throw<ArgumentException>().WithMessage("*not allowed by Azure Key Vault*");
	}

	[Fact]
	public void Should_Throw_When_NormalizedNameExceedsLimit()
	{
		// Arrange
		var name = new string('a', 127) + "_x";

		// Act
		var act = () => AzureSecretName.From(name);

		// Assert
		act.Should().Throw<ArgumentException>().WithMessage("*127-character limit*");
	}
}