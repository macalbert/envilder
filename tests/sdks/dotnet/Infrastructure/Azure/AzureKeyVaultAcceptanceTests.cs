namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using global::Envilder.Infrastructure.Azure;
using global::Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class AzureKeyVaultAcceptanceTests : IDisposable
{
	private readonly LocalStackAzureFixture _localStackAzure;
	private readonly string _tempDir = Path.Combine(Path.GetTempPath(), $"envilder-azure-{Guid.NewGuid():N}");

	public AzureKeyVaultAcceptanceTests(LocalStackAzureFixture localStackAzure)
	{
		_localStackAzure = localStackAzure;
		Directory.CreateDirectory(_tempDir);
	}

	public void Dispose()
	{
		Directory.Delete(_tempDir, true);
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_ResolveSecretFromKeyVault_When_SecretExistsInLocalStack()
	{
		// Arrange
		await _localStackAzure.SecretClient.SetSecretAsync("test-secret", "vault-secret-value", TestContext.Current.CancellationToken);

		var provider = new AzureKeyVaultSecretProvider(_localStackAzure.SecretClient);
		var sut = new EnvilderClient(provider);
		var mapFile = new ParsedMapFile(
			new MapFileConfig
			{
				Provider = SecretProviderType.Azure,
				VaultUrl = _localStackAzure.VaultUrl,
			},
			new Dictionary<string, string>
			{
				["VAULT_SECRET"] = "test-secret",
			});

		// Act
		var actual = await sut.ResolveSecretsAsync(mapFile, TestContext.Current.CancellationToken);

		// Assert
		actual.Should().ContainKey("VAULT_SECRET");
		actual["VAULT_SECRET"].Should().Be("vault-secret-value");
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_ReturnEmptyForMissingKeyVaultSecret_When_SecretDoesNotExist()
	{
		// Arrange
		var provider = new AzureKeyVaultSecretProvider(_localStackAzure.SecretClient);
		var client = new EnvilderClient(provider);
		var mapFile = new ParsedMapFile(
			new MapFileConfig
			{
				Provider = SecretProviderType.Azure,
				VaultUrl = _localStackAzure.VaultUrl,
			},
			new Dictionary<string, string>
			{
				["MISSING"] = "nonexistent-secret",
			});

		// Act
		var actual = await client.ResolveSecretsAsync(mapFile, TestContext.Current.CancellationToken);

		// Assert
		actual.Should().BeEmpty();
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_ResolveSecretThroughBuilder_When_EmulatorHostIsAllowed()
	{
		// Arrange
		await _localStackAzure.SecretClient.SetSecretAsync("builder-secret", "builder-value", TestContext.Current.CancellationToken);
		var mapPath = Path.Combine(_tempDir, "envilder.json");
		File.WriteAllText(mapPath, $$"""
			{
				"$config": { "provider": "azure", "vaultUrl": "{{_localStackAzure.VaultUrl}}" },
				"BUILDER_SECRET": "builder-secret"
			}
			""");
		var sut = Env.FromMapFile(mapPath).WithAllowedVaultHosts(".localhost.localstack.cloud");

		// Act
		var actual = await sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.Should().Equal(new Dictionary<string, string> { ["BUILDER_SECRET"] = "builder-value" });
	}
}