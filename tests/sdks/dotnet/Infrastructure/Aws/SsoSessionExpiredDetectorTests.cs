namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.Runtime;
using AwesomeAssertions;
using global::Envilder.Infrastructure.Aws;

public class SsoSessionExpiredDetectorTests
{
	[Fact]
	public void Should_ReturnTrue_When_ExceptionTypeNameIsUnauthorizedException()
	{
		// Arrange
		var exception = new UnauthorizedException();

		// Act
		var actual = SsoSessionExpiredDetector.IsSsoSessionExpired(exception);

		// Assert
		actual.Should().BeTrue();
	}

	[Fact]
	public void Should_ReturnTrue_When_ExceptionTypeNameIsInvalidGrantException()
	{
		// Arrange
		var exception = new InvalidGrantException();

		// Act
		var actual = SsoSessionExpiredDetector.IsSsoSessionExpired(exception);

		// Assert
		actual.Should().BeTrue();
	}

	[Fact]
	public void Should_ReturnTrue_When_SsoExceptionIsNestedInInnerChain()
	{
		// Arrange
		var exception = new Exception("outer", new UnauthorizedException());

		// Act
		var actual = SsoSessionExpiredDetector.IsSsoSessionExpired(exception);

		// Assert
		actual.Should().BeTrue();
	}

	[Fact]
	public void Should_ReturnFalse_When_ExceptionIsExpiredTokenServiceException()
	{
		// Arrange
		var exception = new AmazonServiceException("token expired") { ErrorCode = "ExpiredToken" };

		// Act
		var actual = SsoSessionExpiredDetector.IsSsoSessionExpired(exception);

		// Assert
		actual.Should().BeFalse();
	}

	[Fact]
	public void Should_ReturnFalse_When_ExceptionIsNull()
	{
		// Act
		var actual = SsoSessionExpiredDetector.IsSsoSessionExpired(null);

		// Assert
		actual.Should().BeFalse();
	}

	private sealed class UnauthorizedException : Exception
	{
	}

	private sealed class InvalidGrantException : Exception
	{
	}
}