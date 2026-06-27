namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.Runtime;
using AwesomeAssertions;
using global::Envilder.Infrastructure.Aws;

public class ExpiredCredentialsDetectorTests
{
	[Fact]
	public void Should_ReturnFalse_When_ExceptionTypeNameIsUnauthorizedClientException()
	{
		// Arrange
		var exception = new UnauthorizedClientException();

		// Act
		var actual = ExpiredCredentialsDetector.IsExpiredCredentials(exception);

		// Assert
		actual.Should().BeFalse();
	}

	[Fact]
	public void Should_ReturnFalse_When_ExceptionTypeNameIsInvalidGrantException()
	{
		// Arrange
		var exception = new InvalidGrantException();

		// Act
		var actual = ExpiredCredentialsDetector.IsExpiredCredentials(exception);

		// Assert
		actual.Should().BeFalse();
	}

	[Fact]
	public void Should_ReturnTrue_When_AmazonServiceExceptionHasExpiredTokenErrorCode()
	{
		// Arrange
		var exception = new AmazonServiceException("token expired") { ErrorCode = "ExpiredToken" };

		// Act
		var actual = ExpiredCredentialsDetector.IsExpiredCredentials(exception);

		// Assert
		actual.Should().BeTrue();
	}

	private sealed class UnauthorizedClientException : Exception
	{
	}

	private sealed class InvalidGrantException : Exception
	{
	}
}