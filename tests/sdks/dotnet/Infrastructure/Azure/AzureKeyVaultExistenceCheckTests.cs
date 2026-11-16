namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using global::Azure;
using global::Azure.Identity;
using global::Azure.Security.KeyVault.Secrets;
using global::Envilder.Domain.Ports;
using global::Envilder.Infrastructure.Azure;
using NSubstitute;

public class AzureKeyVaultExistenceCheckTests
{
	private readonly SecretClient _secretClient = Substitute.For<SecretClient>();

	private ISecretExistenceChecker CreateSut()
	{
		return new AzureKeyVaultSecretProvider(_secretClient);
	}

	private static SecretProperties Properties(string name, bool? enabled = true)
	{
		return new SecretProperties(name) { Enabled = enabled };
	}

	private void ListSecrets(params SecretProperties[] secrets)
	{
		var page = Page<SecretProperties>.FromValues(secrets, null, Substitute.For<Response>());
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(AsyncPageable<SecretProperties>.FromPages([page]));
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportExistsAndMissing_When_VaultListsOnlySomeSecrets()
	{
		// Arrange
		ListSecrets(Properties("app-db"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db", "/app/other"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.Exists);
		actual["/app/other"].Status.Should().Be(SecretExistenceStatus.Missing);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_MatchIgnoringCase_When_NameDiffersOnlyByCase()
	{
		// Arrange
		ListSecrets(Properties("App-DB"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.Exists);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CountAsMissing_When_SecretIsDisabled()
	{
		// Arrange
		ListSecrets(Properties("app-db", enabled: false));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.Missing);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CountAsExisting_When_EnabledFlagIsNotReported()
	{
		// Arrange
		ListSecrets(Properties("app-db", enabled: null));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["/app/db"], TestContext.Current.CancellationToken);

		// Assert
		actual["/app/db"].Status.Should().Be(SecretExistenceStatus.Exists);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ListOnceAndNeverReadValues_When_CheckingSeveralNames()
	{
		// Arrange
		ListSecrets(Properties("a"), Properties("b"));
		var sut = CreateSut();

		// Act
		await sut.CheckSecretsExistAsync(["a", "b", "c"], TestContext.Current.CancellationToken);

		// Assert
		_secretClient.Received(1).GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>());
		await _secretClient.DidNotReceiveWithAnyArgs().GetSecretAsync(default!, default, default);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_NotListVault_When_NoNamesAreChecked()
	{
		// Arrange
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync([], TestContext.Current.CancellationToken);

		// Assert
		actual.Should().BeEmpty();
		_secretClient.DidNotReceiveWithAnyArgs().GetPropertiesOfSecretsAsync(default);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAccessDeniedForEveryName_When_ListIsForbidden()
	{
		// Arrange
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(_ => throw new RequestFailedException(403, "Forbidden"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["a", "b"], TestContext.Current.CancellationToken);

		// Assert
		actual.Values.Should().OnlyContain(existence => existence.Status == SecretExistenceStatus.AccessDenied);
		actual.Should().HaveCount(2);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailed_When_ServiceReturns401()
	{
		// Arrange
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(_ => throw new RequestFailedException(401, "Unauthorized"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["a"], TestContext.Current.CancellationToken);

		// Assert
		actual["a"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailed_When_CredentialIsUnavailable()
	{
		// Arrange
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(_ => throw new CredentialUnavailableException("no credential"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["a"], TestContext.Current.CancellationToken);

		// Assert
		actual["a"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
		actual["a"].Reason.Should().Be("no credential");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailed_When_AuthenticationFails()
	{
		// Arrange
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(_ => throw new AuthenticationFailedException("rejected"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["a"], TestContext.Current.CancellationToken);

		// Assert
		actual["a"].Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportProviderError_When_ServiceFails()
	{
		// Arrange
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(_ => throw new RequestFailedException(503, "unavailable"));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["a"], TestContext.Current.CancellationToken);

		// Assert
		actual["a"].Status.Should().Be(SecretExistenceStatus.ProviderError);
		actual["a"].Reason.Should().Contain("unavailable");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_PropagateCancellation_When_CallerCancels()
	{
		// Arrange
		using var cts = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
		cts.Cancel();
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(_ => throw new OperationCanceledException(cts.Token));
		var sut = CreateSut();

		// Act
		var act = () => sut.CheckSecretsExistAsync(["a"], cts.Token);

		// Assert
		await act.Should().ThrowAsync<OperationCanceledException>();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportProviderError_When_ClientTimesOut()
	{
		// Arrange
		_secretClient.GetPropertiesOfSecretsAsync(Arg.Any<CancellationToken>())
			.Returns(_ => throw new TaskCanceledException("The operation was cancelled because it exceeded the configured timeout."));
		var sut = CreateSut();

		// Act
		var actual = await sut.CheckSecretsExistAsync(["a"], TestContext.Current.CancellationToken);

		// Assert
		actual["a"].Status.Should().Be(SecretExistenceStatus.ProviderError);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_PassCancellationTokenToList_When_CheckingNames()
	{
		// Arrange
		using var source = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
		ListSecrets(Properties("a"));
		var sut = CreateSut();

		// Act
		await sut.CheckSecretsExistAsync(["a"], source.Token);

		// Assert
		_secretClient.Received(1).GetPropertiesOfSecretsAsync(source.Token);
	}
}