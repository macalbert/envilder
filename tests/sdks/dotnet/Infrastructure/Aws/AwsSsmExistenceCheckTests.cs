namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.Runtime;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using Amazon.SSOOIDC.Model;
using AwesomeAssertions;
using global::Envilder.Domain.Ports;
using global::Envilder.Infrastructure.Aws;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

public class AwsSsmExistenceCheckTests
{
	private readonly IAmazonSimpleSystemsManagement _ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();

	private ISecretExistenceChecker CreateSut(string? profile = null)
	{
		return new AwsSsmSecretProvider(_ssmClient, profile);
	}

	private static AmazonServiceException ServiceError(string errorCode, string message = "provider message")
	{
		return new AmazonServiceException(message) { ErrorCode = errorCode };
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportExistsAndMissing_When_InvalidParametersAreReturned()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.Returns(new GetParametersResponse { InvalidParameters = ["/app/missing"] });
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/there", "/app/missing"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/there"].Status.Should().Be(SecretExistenceStatus.Exists);
		actual["/app/missing"].Status.Should().Be(SecretExistenceStatus.Missing);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_RequestWithoutDecryption_When_CheckingExistence()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.Returns(new GetParametersResponse());
		var sut = CreateSut();

		// Act
		await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		await _ssmClient.Received(1).GetParametersAsync(
			Arg.Is<GetParametersRequest>(r => r.WithDecryption == false && r.Names.Count == 1 && r.Names[0] == "/app/db"),
			Arg.Any<CancellationToken>());
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_NeverReadValues_When_ParametersAreReturned()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.Returns(new GetParametersResponse
			{
				Parameters = [new Parameter { Name = "/app/db", Value = "must-not-leak-value" }],
			});
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Reason.Should().BeNull();
		await _ssmClient.DidNotReceiveWithAnyArgs().GetParameterAsync(default!, default);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_SplitIntoBatchesOfTen_When_MoreThanTenNames()
	{
		// Arrange
		var batchSizes = new List<int>();
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.Returns(callInfo =>
			{
				batchSizes.Add(callInfo.Arg<GetParametersRequest>().Names.Count);
				return new GetParametersResponse();
			});
		var names = Enumerable.Range(1, 25).Select(i => $"/app/p{i}").ToList();
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(names, TestContext.Current.CancellationToken);

		// Assert
		batchSizes.Should().Equal(10, 10, 5);
		actual.Should().HaveCount(25);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CheckNameOnce_When_NamesRepeat()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.Returns(new GetParametersResponse());
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db", "/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual.Should().ContainSingle();
		await _ssmClient.Received(1).GetParametersAsync(
			Arg.Is<GetParametersRequest>(r => r.Names.Count == 1),
			Arg.Any<CancellationToken>());
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_RetryEachNameAlone_When_BatchFailsWithAccessDenied()
	{
		// Arrange
		_ssmClient.GetParametersAsync(
				Arg.Is<GetParametersRequest>(r => r.Names.Count == 2),
				Arg.Any<CancellationToken>())
			.ThrowsAsync(ServiceError("AccessDeniedException"));
		_ssmClient.GetParametersAsync(
				Arg.Is<GetParametersRequest>(r => r.Names.Count == 1 && r.Names[0] == "/app/allowed"),
				Arg.Any<CancellationToken>())
			.Returns(new GetParametersResponse());
		_ssmClient.GetParametersAsync(
				Arg.Is<GetParametersRequest>(r => r.Names.Count == 1 && r.Names[0] == "/app/denied"),
				Arg.Any<CancellationToken>())
			.ThrowsAsync(ServiceError("AccessDeniedException"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/allowed", "/app/denied"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/allowed"].Status.Should().Be(SecretExistenceStatus.Exists);
		actual["/app/denied"].Status.Should().Be(SecretExistenceStatus.AccessDenied);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_RetryEachNameAlone_When_BatchFailsWithValidationException()
	{
		// Arrange
		_ssmClient.GetParametersAsync(
				Arg.Is<GetParametersRequest>(r => r.Names.Count == 2),
				Arg.Any<CancellationToken>())
			.ThrowsAsync(ServiceError("ValidationException"));
		_ssmClient.GetParametersAsync(
				Arg.Is<GetParametersRequest>(r => r.Names.Count == 1 && r.Names[0] == "/app/good"),
				Arg.Any<CancellationToken>())
			.Returns(new GetParametersResponse());
		_ssmClient.GetParametersAsync(
				Arg.Is<GetParametersRequest>(r => r.Names.Count == 1 && r.Names[0] == "/app/bad name"),
				Arg.Any<CancellationToken>())
			.ThrowsAsync(ServiceError("ValidationException", "invalid name"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/good", "/app/bad name"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/good"].Status.Should().Be(SecretExistenceStatus.Exists);
		actual["/app/bad name"].Status.Should().Be(SecretExistenceStatus.ProviderError);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAccessDeniedNotMissing_When_SingleNameIsDenied()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(ServiceError("AccessDeniedException", "not authorized"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.AccessDenied);
		actual["/app/db"].Reason.Should().Be("not authorized");
	}

	[Theory]
	[InlineData("UnrecognizedClientException")]
	[InlineData("InvalidClientTokenId")]
	[InlineData("InvalidSignatureException")]
	[InlineData("IncompleteSignatureException")]
	public async Task Should_ReportAuthenticationFailed_When_ProviderRejectsCredentials(string errorCode)
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(ServiceError(errorCode, "bad credentials"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/a", "/app/b"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/a"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
		actual["/app/b"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailedWithRemediation_When_SsoSessionExpired()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new UnauthorizedClientException("sso token rejected"));
		var sut = CreateSut("staging");

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
		actual["/app/db"].Reason.Should().Be(new SsoSessionExpiredException("staging").Message);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailedWithRemediation_When_TokenExpired()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(ServiceError("ExpiredTokenException", "token expired"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
		actual["/app/db"].Reason.Should().Be(new ExpiredCredentialsException().Message);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailed_When_NoCredentialsCanBeFound()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new AmazonServiceException("Unable to find credentials"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
		actual["/app/db"].Reason.Should().Be("Unable to find credentials");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailed_When_ClientCannotResolveCredentials()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new AmazonClientException("Credentials must be set. No credentials were supplied"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportProviderError_When_ProviderIsUnreachable()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new AmazonServiceException("connection refused"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.ProviderError);
		actual["/app/db"].Reason.Should().Be("connection refused");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_PropagateCancellation_When_CallerCancels()
	{
		// Arrange
		using var cts = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
		cts.Cancel();
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new OperationCanceledException(cts.Token));
		var sut = CreateSut();

		// Act
		var act = () => sut.CheckSecretsExistAsync(["/app/db"], cts.Token);

		// Assert
		await act.Should().ThrowAsync<OperationCanceledException>();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportProviderError_When_ClientTimesOut()
	{
		// Arrange
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new TaskCanceledException("The request timed out."));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.ProviderError);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_PassCancellationTokenToEveryCall_When_CheckingSeveralBatches()
	{
		// Arrange
		using var source = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
		_ssmClient.GetParametersAsync(Arg.Any<GetParametersRequest>(), Arg.Any<CancellationToken>())
			.Returns(new GetParametersResponse());
		var names = Enumerable.Range(1, 12).Select(i => $"/app/p{i}").ToList();
		var sut = CreateSut();

		// Act
		await sut.CheckSecretsExistAsync(names, source.Token);

		// Assert
		await _ssmClient.Received(2).GetParametersAsync(Arg.Any<GetParametersRequest>(), source.Token);
	}
}