namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.Runtime;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using AwesomeAssertions;
using global::Envilder.Infrastructure.Aws;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

public class ExpiredCredentialsTests
{
	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowExpiredCredentialsException_When_GetParameterFailsWithExpiredToken()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		var expiredTokenException = new AmazonServiceException("The security token included in the request is expired")
		{
			ErrorCode = "ExpiredTokenException",
		};
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(expiredTokenException);
		var sut = new AwsSsmSecretProvider(ssmClient);

		// Act
		var act = () => sut.GetSecretAsync("/p");

		// Assert
		await act.Should().ThrowAsync<ExpiredCredentialsException>()
			.WithMessage("*aws sso login*");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowExpiredCredentialsException_When_InnerExceptionHasExpiredErrorCode()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		var wrappedExpiredException = new AmazonClientException(
			"Unable to load credentials",
			new AmazonServiceException("token expired") { ErrorCode = "ExpiredTokenException" });
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(wrappedExpiredException);
		var sut = new AwsSsmSecretProvider(ssmClient);

		// Act
		var act = () => sut.GetSecretAsync("/p");

		// Assert
		await act.Should().ThrowAsync<ExpiredCredentialsException>();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReturnNull_When_ParameterNotFound()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new ParameterNotFoundException("not found"));
		var sut = new AwsSsmSecretProvider(ssmClient);

		// Act
		var actual = await sut.GetSecretAsync("/p");

		// Assert
		actual.Should().BeNull();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_RethrowOriginalException_When_ErrorIsUnrelated()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		var unrelatedException = new AmazonServiceException("boom")
		{
			ErrorCode = "InternalFailure",
		};
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(unrelatedException);
		var sut = new AwsSsmSecretProvider(ssmClient);

		// Act
		var act = () => sut.GetSecretAsync("/p");

		// Assert
		await act.Should().ThrowAsync<AmazonServiceException>();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public void Should_ThrowExpiredCredentialsException_When_GetSecretFailsWithExpiredToken()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		var expiredTokenException = new AmazonServiceException("The security token included in the request is expired")
		{
			ErrorCode = "ExpiredTokenException",
		};
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(expiredTokenException);
		var sut = new AwsSsmSecretProvider(ssmClient);

		// Act
		var act = () => sut.GetSecret("/p");

		// Assert
		act.Should().Throw<ExpiredCredentialsException>()
			.WithMessage("*aws sso login*");
	}
}