namespace Envilder.Tests;

using AwesomeAssertions;

public class SsoSessionExpiredExceptionTests
{
	[Fact]
	public void Should_BuildBareLoginMessage_When_ProfileNameIsNull()
	{
		// Act
		var actual = new SsoSessionExpiredException(null);

		// Assert
		actual.ProfileName.Should().BeNull();
		actual.Message.Should().Contain("aws sso login");
		actual.Message.Should().NotContain("--profile");
	}

	[Fact]
	public void Should_ExposeProfileNameAndTargetedHint_When_ProfileNameProvided()
	{
		// Arrange
		const string profile = "staging";

		// Act
		var actual = new SsoSessionExpiredException(profile);

		// Assert
		actual.ProfileName.Should().Be("staging");
		actual.Message.Should().Contain("aws sso login --profile staging");
	}

	[Fact]
	public void Should_PreserveInnerExceptionAndProfile_When_InnerExceptionProvided()
	{
		// Arrange
		var inner = new InvalidOperationException("boom");

		// Act
		var actual = new SsoSessionExpiredException("prod", inner);

		// Assert
		actual.InnerException.Should().BeSameAs(inner);
		actual.ProfileName.Should().Be("prod");
		actual.Message.Should().Contain("aws sso login --profile prod");
	}
}