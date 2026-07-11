namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using Amazon.SSOOIDC.Model;
using AwesomeAssertions;
using global::Envilder.Infrastructure.Aws;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

public class SsoSessionExpiredProviderTests
{
	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowSsoSessionExpiredException_When_GetSecretAsyncEncountersSsoFailure()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new UnauthorizedClientException("sso token rejected"));
		var sut = new AwsSsmSecretProvider(ssmClient, "staging");

		// Act
		var act = () => sut.GetSecretAsync("/p");

		// Assert
		var assertion = await act.Should().ThrowAsync<SsoSessionExpiredException>();
		assertion.Which.ProfileName.Should().Be("staging");
		assertion.Which.Message.Should().Contain("aws sso login --profile staging");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public void Should_ThrowSsoSessionExpiredException_When_GetSecretEncountersSsoFailure()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new UnauthorizedClientException("sso token rejected"));
		var sut = new AwsSsmSecretProvider(ssmClient, "staging");

		// Act
		var act = () => sut.GetSecret("/p");

		// Assert
		var assertion = act.Should().Throw<SsoSessionExpiredException>();
		assertion.Which.ProfileName.Should().Be("staging");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CarryNullProfile_When_NoProfileConfiguredAndSsoFailureOccurs()
	{
		// Arrange
		var ssmClient = Substitute.For<IAmazonSimpleSystemsManagement>();
		ssmClient.GetParameterAsync(Arg.Any<GetParameterRequest>(), Arg.Any<CancellationToken>())
			.ThrowsAsync(new InvalidGrantException("invalid grant"));
		var sut = new AwsSsmSecretProvider(ssmClient);

		// Act
		var act = () => sut.GetSecretAsync("/p");

		// Assert
		var assertion = await act.Should().ThrowAsync<SsoSessionExpiredException>();
		assertion.Which.ProfileName.Should().BeNull();
	}
}