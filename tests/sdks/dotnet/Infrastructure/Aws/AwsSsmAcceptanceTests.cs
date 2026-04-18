namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using AwesomeAssertions;
using Envilder.Application;
using Envilder.Domain;
using Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class AwsSsmAcceptanceTests
{
	private readonly LocalStackFixture _localStack;

	public AwsSsmAcceptanceTests(LocalStackFixture localStack)
	{
		_localStack = localStack;
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ResolveSecretFromSsm_When_ParameterExistsInLocalStack()
	{
		// Arrange
		await _localStack.SsmClient.PutParameterAsync(new()
		{
			Name = "/Test/MySecret",
			Value = "real-secret-from-localstack",
			Type = ParameterType.SecureString,
			Overwrite = true,
		});

		var sut = new EnvilderClient(_localStack.CreateProvider());
		var mapFile = new ParsedMapFile(
			new(),
			new()
			{
				["MY_SECRET"] = "/Test/MySecret",
			});

		// Act
		var actual = await sut.ResolveSecretsAsync(mapFile);

		// Assert
		actual.Should().ContainKey("MY_SECRET");
		actual["MY_SECRET"].Should().Be("real-secret-from-localstack");
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ReturnEmptyForMissingSsmParameter_When_ParameterDoesNotExist()
	{
		// Arrange
		var sut = new EnvilderClient(_localStack.CreateProvider());
		var mapFile = new ParsedMapFile(
			new(),
			new()
			{
				["NONEXISTENT"] = "/Test/DoesNotExist",
			});

		// Act
		var actual = await sut.ResolveSecretsAsync(mapFile);

		// Assert
		actual.Should().BeEmpty();
	}
}