namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using global::Envilder.Infrastructure.Azure;

// The same cases are pinned in the CLI, Node.js and Python tests: every
// surface must send Key Vault the same secret name.
public class AzureSecretNameTests
{
	[Theory]
	[InlineData("MY-SECRET-NAME")]
	[InlineData("Database--Password")]
	[InlineData("1password-token")]
	[InlineData("my_secret_name")]
	[InlineData("db.url")]
	public void Should_PassNameAsWritten_When_NameHasNoSlash(string name)
	{
		// Act
		var actual = AzureSecretName.From(name);

		// Assert
		actual.Should().Be(name);
	}

	[Theory]
	[InlineData("/myapp/db/password", "myapp-db-password")]
	[InlineData("myapp/db_password", "myapp-db_password")]
	[InlineData("/MyApp/Db", "MyApp-Db")]
	[InlineData("//a//b", "a--b")]
	public void Should_TurnSlashesIntoHyphens_When_NameHasSlashes(string name, string expected)
	{
		// Act
		var actual = AzureSecretName.From(name);

		// Assert
		actual.Should().Be(expected);
	}
}