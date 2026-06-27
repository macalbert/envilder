namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.Runtime;
using Amazon.SSOOIDC.Model;
using AwesomeAssertions;
using global::Envilder.Infrastructure.Aws;

public class ExpiredCredentialsDetectorTests
{
	[Fact]
	public void Should_ReturnFalse_When_ExceptionTypeNameIsUnauthorizedClientException()
	{
		// Arrange
		var exception = new UnauthorizedClientException("sso token rejected");

		// Act
		var actual = ExpiredCredentialsDetector.IsExpiredCredentials(exception);

		// Assert
		actual.Should().BeFalse();
	}

	[Fact]
	public void Should_ReturnFalse_When_ExceptionTypeNameIsInvalidGrantException()
	{
		// Arrange
		var exception = new InvalidGrantException("invalid grant");

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
}