namespace Envilder.Tests.Infrastructure.Azure;

using AwesomeAssertions;
using global::Envilder.Infrastructure.Azure;
using global::Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class AzureKeyVaultContractValidationAcceptanceTests : IDisposable
{
	private const string SecretValue = "acceptance-vault-value-must-not-leak";

	private readonly LocalStackAzureFixture _localStackAzure;
	private readonly string _directory;

	public AzureKeyVaultContractValidationAcceptanceTests(LocalStackAzureFixture localStackAzure)
	{
		_localStackAzure = localStackAzure;
		_directory = Path.Combine(Path.GetTempPath(), $"envilder-azure-contract-{Guid.NewGuid():N}");
		Directory.CreateDirectory(_directory);
	}

	public void Dispose()
	{
		Directory.Delete(_directory, recursive: true);
	}

	private EnvilderBuilder CreateSut(string json)
	{
		var path = Path.Combine(_directory, "envilder.json");
		File.WriteAllText(path, json);
		return new EnvilderBuilder(
			path,
			(_, _) => new AzureKeyVaultSecretProvider(_localStackAzure.SecretClient));
	}

	private string MapFile(string mappings)
	{
		return $$"""{"$config":{"provider":"azure","vaultUrl":"{{_localStackAzure.VaultUrl}}"},{{mappings}}}""";
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_BeValid_When_EveryMappedSecretExistsInLocalStack()
	{
		// Arrange
		await _localStackAzure.SecretClient.SetSecretAsync("contract-valid-db", SecretValue, TestContext.Current.CancellationToken);
		var sut = CreateSut(MapFile("\"DB_URL\":\"/contract/valid/db\""));

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeTrue();
		actual.Keys.Should().ContainSingle().Which.Provider.Should().Be(SecretProviderType.Azure);
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_ReportMissingKey_When_SecretDoesNotExistInLocalStack()
	{
		// Arrange
		await _localStackAzure.SecretClient.SetSecretAsync("contract-partial-db", SecretValue, TestContext.Current.CancellationToken);
		var sut = CreateSut(MapFile("\"DB_URL\":\"contract-partial-db\",\"API_KEY\":\"contract-partial-absent\""));

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.Keys.Single(key => key.Variable == "DB_URL").Status.Should().Be(SecretExistenceStatus.Exists);
		actual.Keys.Single(key => key.Variable == "API_KEY").Status.Should().Be(SecretExistenceStatus.Missing);
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_NeverExposeSecretValue_When_ContractIsValidated()
	{
		// Arrange
		await _localStackAzure.SecretClient.SetSecretAsync("contract-leak-db", SecretValue, TestContext.Current.CancellationToken);
		var sut = CreateSut(MapFile("\"DB_URL\":\"contract-leak-db\""));

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		var text = string.Join("|", actual.Keys.Select(key => $"{key.Variable}{key.Path}{key.Status}{key.Reason}"));
		text.Should().NotContain(SecretValue);
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_FailTheLoad_When_ContractValidationIsEnabledAndSecretIsMissing()
	{
		// Arrange
		var sut = CreateSut(MapFile("\"DB_URL\":\"contract-load-absent\"")).WithContractValidation();

		// Act
		var act = () => sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		var assertion = await act.Should().ThrowAsync<ContractValidationException>();
		assertion.Which.Message.Should().Be(
			"Map file contract validation failed: DB_URL (contract-load-absent): missing");
	}

	[Fact(Timeout = CancellationTokenForTest.LongTimeout)]
	public async Task Should_ResolveSecrets_When_ContractValidationIsEnabledAndSecretsExist()
	{
		// Arrange
		await _localStackAzure.SecretClient.SetSecretAsync("contract-load-present", SecretValue, TestContext.Current.CancellationToken);
		var sut = CreateSut(MapFile("\"DB_URL\":\"contract-load-present\"")).WithContractValidation();

		// Act
		var actual = await sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		actual["DB_URL"].Should().Be(SecretValue);
	}
}