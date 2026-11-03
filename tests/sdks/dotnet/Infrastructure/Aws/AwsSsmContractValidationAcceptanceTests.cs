namespace Envilder.Tests.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using AwesomeAssertions;
using global::Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class AwsSsmContractValidationAcceptanceTests : IDisposable
{
	private const string SecretValue = "acceptance-secret-value-must-not-leak";

	private readonly LocalStackFixture _localStack;
	private readonly string _directory;

	public AwsSsmContractValidationAcceptanceTests(LocalStackFixture localStack)
	{
		_localStack = localStack;
		_directory = Path.Combine(Path.GetTempPath(), $"envilder-aws-contract-{Guid.NewGuid():N}");
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
		return new EnvilderBuilder(path, (_, _) => _localStack.CreateProvider());
	}

	private Task PutSecureStringAsync(string name, CancellationToken cancellationToken)
	{
		return _localStack.SsmClient.PutParameterAsync(new()
		{
			Name = name,
			Value = SecretValue,
			Type = ParameterType.SecureString,
			Overwrite = true,
		}, cancellationToken);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_BeValid_When_EveryMappedParameterExistsInLocalStack()
	{
		// Arrange
		await PutSecureStringAsync("/Contract/Valid/Db", TestContext.Current.CancellationToken);
		await PutSecureStringAsync("/Contract/Valid/Key", TestContext.Current.CancellationToken);
		var sut = CreateSut("""{"DB_URL":"/Contract/Valid/Db","API_KEY":"/Contract/Valid/Key"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeTrue();
		actual.Keys.Should().HaveCount(2);
		actual.Keys.Should().OnlyContain(key => key.Status == SecretExistenceStatus.Exists);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ReportMissingKey_When_ParameterDoesNotExistInLocalStack()
	{
		// Arrange
		await PutSecureStringAsync("/Contract/Partial/Db", TestContext.Current.CancellationToken);
		var sut = CreateSut("""{"DB_URL":"/Contract/Partial/Db","API_KEY":"/Contract/Partial/Absent"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.Keys.Single(key => key.Variable == "DB_URL").Status.Should().Be(SecretExistenceStatus.Exists);
		actual.Keys.Single(key => key.Variable == "API_KEY").Status.Should().Be(SecretExistenceStatus.Missing);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_NeverExposeSecretValue_When_ContractIsValidated()
	{
		// Arrange
		await PutSecureStringAsync("/Contract/Leak/Db", TestContext.Current.CancellationToken);
		var sut = CreateSut("""{"DB_URL":"/Contract/Leak/Db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		var text = string.Join("|", actual.Keys.Select(key => $"{key.Variable}{key.Path}{key.Status}{key.Reason}"));
		text.Should().NotContain(SecretValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_FailTheLoad_When_ContractValidationIsEnabledAndParameterIsMissing()
	{
		// Arrange
		var sut = CreateSut("""{"DB_URL":"/Contract/Load/Absent"}""").WithContractValidation();

		// Act
		var act = () => sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		var assertion = await act.Should().ThrowAsync<ContractValidationException>();
		assertion.Which.Message.Should().Be(
			"Map file contract validation failed: DB_URL (/Contract/Load/Absent): missing");
		assertion.Which.Message.Should().NotContain(SecretValue);
	}

	[Fact(Timeout = CancellationTokenForTest.DefaultTimeout)]
	public async Task Should_ResolveSecrets_When_ContractValidationIsEnabledAndParametersExist()
	{
		// Arrange
		await PutSecureStringAsync("/Contract/Load/Present", TestContext.Current.CancellationToken);
		var sut = CreateSut("""{"DB_URL":"/Contract/Load/Present"}""").WithContractValidation();

		// Act
		var actual = await sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		actual["DB_URL"].Should().Be(SecretValue);
	}
}