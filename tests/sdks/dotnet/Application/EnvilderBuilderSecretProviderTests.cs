namespace Envilder.Tests.Application;

using AwesomeAssertions;
using global::Envilder.Domain.Ports;
using global::Envilder.Tests.Doubles;
using NSubstitute;

public class EnvilderBuilderSecretProviderTests : IDisposable
{
	private readonly string _directory;
	private readonly List<string> _envVarsToClean = new();

	public EnvilderBuilderSecretProviderTests()
	{
		_directory = Path.Combine(Path.GetTempPath(), $"envilder-injected-{Guid.NewGuid():N}");
		Directory.CreateDirectory(_directory);
	}

	public void Dispose()
	{
		Directory.Delete(_directory, recursive: true);
		foreach (var key in _envVarsToClean)
		{
			Environment.SetEnvironmentVariable(key, null);
		}
	}

	private string WriteMapFile(string json)
	{
		var path = Path.Combine(_directory, $"{Guid.NewGuid():N}.json");
		File.WriteAllText(path, json);
		return path;
	}

	private string NewVariable()
	{
		var name = $"INJECTED_TEST_{Guid.NewGuid():N}";
		_envVarsToClean.Add(name);
		return name;
	}

	private static ISecretProvider CreateProviderWithoutExistenceCheck()
	{
		var provider = Substitute.For<ISecretProvider>();
		provider.GetSecret(Arg.Any<string>()).Returns(FakeCheckingSecretProvider.ResolvedValue);
		provider.GetSecretAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
			.Returns(FakeCheckingSecretProvider.ResolvedValue);
		return provider;
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ResolveFromInjectedProvider_When_SecretProviderInjected()
	{
		// Arrange
		var variable = NewVariable();
		var path = WriteMapFile($$"""{"{{variable}}":"/app/db"}""");
		var sut = Env.FromMapFile(path).WithSecretProvider(CreateProviderWithoutExistenceCheck());

		// Act
		var actual = await sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.Should().Equal(new Dictionary<string, string>
		{
			[variable] = FakeCheckingSecretProvider.ResolvedValue,
		});
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CheckKeysWithInjectedProvider_When_ProviderCanCheckExistence()
	{
		// Arrange
		var present = NewVariable();
		var absent = NewVariable();
		var provider = new FakeCheckingSecretProvider();
		provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		provider.Existence["/app/token"] = new(SecretExistenceStatus.Missing);
		var path = WriteMapFile($$"""{"{{present}}":"/app/db","{{absent}}":"/app/token"}""");
		var sut = Env.FromMapFile(path).WithSecretProvider(provider);

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.Keys.Should().BeEquivalentTo(
			[
				new KeyCheck(present, "/app/db", SecretProviderType.Aws, SecretExistenceStatus.Exists),
				new KeyCheck(absent, "/app/token", SecretProviderType.Aws, SecretExistenceStatus.Missing),
			],
			options => options.WithStrictOrdering());
		provider.CheckCalls.Should().Be(1);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportEveryKeyAsProviderError_When_InjectedProviderCannotCheckExistence()
	{
		// Arrange
		var variable = NewVariable();
		var path = WriteMapFile($$"""{"{{variable}}":"/app/db"}""");
		var sut = Env.FromMapFile(path).WithSecretProvider(CreateProviderWithoutExistenceCheck());

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.Keys.Should().ContainSingle().Which.Should().BeEquivalentTo(
			new KeyCheck(
				variable,
				"/app/db",
				SecretProviderType.Aws,
				SecretExistenceStatus.ProviderError,
				"The provider cannot check whether a secret exists."));
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowContractValidationException_When_InjectedProviderCannotCheckExistence()
	{
		// Arrange
		var variable = NewVariable();
		var path = WriteMapFile($$"""{"{{variable}}":"/app/db"}""");
		var sut = Env.FromMapFile(path)
			.WithSecretProvider(CreateProviderWithoutExistenceCheck())
			.WithContractValidation();

		// Act
		var act = () => sut.InjectAsync(TestContext.Current.CancellationToken);

		// Assert
		await act.Should().ThrowAsync<ContractValidationException>();
		Environment.GetEnvironmentVariable(variable).Should().BeNull();
	}

	[Fact]
	public void Should_InjectSecrets_When_InjectedProviderPassesContractValidation()
	{
		// Arrange
		var variable = NewVariable();
		var provider = new FakeCheckingSecretProvider();
		provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var path = WriteMapFile($$"""{"{{variable}}":"/app/db"}""");
		var sut = Env.FromMapFile(path).WithSecretProvider(provider).WithContractValidation();

		// Act
		sut.Inject();

		// Assert
		Environment.GetEnvironmentVariable(variable).Should().Be(FakeCheckingSecretProvider.ResolvedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportMapFileErrors_When_ProviderInjectedAndConfigIsIncomplete()
	{
		// Arrange
		var provider = new FakeCheckingSecretProvider();
		var path = WriteMapFile("""{"$config":{"provider":"azure"},"DB_URL":"db-url"}""");
		var sut = Env.FromMapFile(path).WithSecretProvider(provider);

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.MapFileErrors.Select(error => error.Key).Should().Equal("$config.vaultUrl");
		provider.CheckCalls.Should().Be(0);
	}

	[Fact]
	public void Should_ThrowArgumentNullException_When_InjectedProviderIsNull()
	{
		// Arrange
		var sut = Env.FromMapFile("envilder.json");

		// Act
		var act = () => sut.WithSecretProvider(null!);

		// Assert
		act.Should().Throw<ArgumentNullException>().WithParameterName("provider");
	}
}