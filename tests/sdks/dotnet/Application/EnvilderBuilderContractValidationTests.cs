namespace Envilder.Tests.Application;

using AutoFixture;
using AwesomeAssertions;
using global::Envilder.Tests.Doubles;

public class EnvilderBuilderContractValidationTests : IDisposable
{
	private readonly Fixture _fixture = new();
	private readonly string _directory;
	private readonly FakeCheckingSecretProvider _provider = new();
	private readonly List<string> _envVarsToClean = new();
	private int _providersCreated;
	private MapFileConfig? _createdWithConfig;
	private EnvilderOptions? _createdWithOptions;

	public EnvilderBuilderContractValidationTests()
	{
		_directory = Path.Combine(Path.GetTempPath(), $"envilder-contract-{Guid.NewGuid():N}");
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

	private EnvilderBuilder CreateSut(string json)
	{
		var path = Path.Combine(_directory, $"{Guid.NewGuid():N}.json");
		File.WriteAllText(path, json);
		return new EnvilderBuilder(path, (config, options) =>
		{
			_providersCreated++;
			_createdWithConfig = config;
			_createdWithOptions = options;
			return _provider;
		});
	}

	private string NewVariable()
	{
		var name = $"CONTRACT_TEST_{Guid.NewGuid():N}";
		_envVarsToClean.Add(name);
		return name;
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReturnValidResult_When_AllSecretsExist()
	{
		// Arrange
		var variable = NewVariable();
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut($$"""{"{{variable}}":"/app/db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeTrue();
		actual.MapFileErrors.Should().BeEmpty();
		actual.Keys.Should().ContainSingle().Which.Should().BeEquivalentTo(
			new KeyCheck(variable, "/app/db", SecretProviderType.Aws, SecretExistenceStatus.Exists));
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailedWithoutThrowing_When_ProfileIsNotFound()
	{
		// Arrange
		var path = Path.Combine(_directory, $"{Guid.NewGuid():N}.json");
		File.WriteAllText(path, """{"$config":{"profile":"nonexistent"},"A":"/a"}""");
		var sut = new EnvilderBuilder(
			path,
			(_, _) => throw new global::Envilder.Infrastructure.AwsProfileNotFoundException("nonexistent"));

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.Keys.Should().ContainSingle().Which.Should().BeEquivalentTo(new KeyCheck(
			"A",
			"/a",
			SecretProviderType.Aws,
			SecretExistenceStatus.AuthenticationFailed,
			"AWS profile 'nonexistent' was not found in the credential store."));
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportMapFileErrorsWithoutCreatingProvider_When_MapFileIsInvalid()
	{
		// Arrange
		var sut = CreateSut("""{"$config":{"provider":"gcp"},"A":"/a"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.MapFileErrors.Should().ContainSingle().Which.Key.Should().Be("$config.provider");
		actual.Keys.Should().BeEmpty();
		_providersCreated.Should().Be(0);
		_provider.CheckCalls.Should().Be(0);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportMapFileError_When_JsonIsInvalid()
	{
		// Arrange
		var sut = CreateSut("{ not json");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.MapFileErrors.Should().ContainSingle().Which.Message.Should().Be("The map file is not valid JSON.");
		_providersCreated.Should().Be(0);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportMissing_When_SecretDoesNotExist()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Missing);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.Keys.Should().ContainSingle().Which.Status.Should().Be(SecretExistenceStatus.Missing);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAccessDeniedNotMissing_When_IdentityCannotCheckSecret()
	{
		// Arrange
		var reason = _fixture.Create<string>();
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.AccessDenied, reason);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		var key = actual.Keys.Should().ContainSingle().Subject;
		key.Status.Should().Be(SecretExistenceStatus.AccessDenied);
		key.Reason.Should().Be(reason);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAuthenticationFailed_When_ProviderRejectsCredentials()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.AuthenticationFailed, "expired");
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeFalse();
		actual.Keys.Should().ContainSingle().Which.Status.Should().Be(SecretExistenceStatus.AuthenticationFailed);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportProviderError_When_ProviderFails()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.ProviderError, "unreachable");
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.Keys.Should().ContainSingle().Which.Status.Should().Be(SecretExistenceStatus.ProviderError);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportProviderError_When_ProviderReturnsNoResultForPath()
	{
		// Arrange
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		var key = actual.Keys.Should().ContainSingle().Subject;
		key.Status.Should().Be(SecretExistenceStatus.ProviderError);
		key.Reason.Should().Be("The provider returned no result for this secret.");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CheckSharedPathOnce_When_TwoVariablesMapToTheSamePath()
	{
		// Arrange
		_provider.Existence["/app/shared"] = new(SecretExistenceStatus.Exists);
		_provider.Existence["/app/other"] = new(SecretExistenceStatus.Missing);
		var sut = CreateSut("""{"B":"/app/shared","A":"/app/other","C":"/app/shared"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		_provider.CheckedBatches.Should().ContainSingle()
			.Which.Should().Equal("/app/shared", "/app/other");
		actual.Keys.Select(key => key.Variable).Should().Equal("B", "A", "C");
		actual.Keys.Select(key => key.Status).Should().Equal(
			SecretExistenceStatus.Exists,
			SecretExistenceStatus.Missing,
			SecretExistenceStatus.Exists);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_BeValidWithoutProviderCall_When_MappingIsEmpty()
	{
		// Arrange
		var sut = CreateSut("""{"$config":{"provider":"aws"}}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.IsValid.Should().BeTrue();
		actual.Keys.Should().BeEmpty();
		_provider.CheckCalls.Should().Be(0);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportEffectiveProvider_When_BuilderOverridesMapFileProvider()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"$config":{"provider":"aws"},"DB_URL":"/app/db"}""")
			.WithProvider(SecretProviderType.Azure)
			.WithVaultUrl("https://v.vault.azure.net");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.Keys.Should().ContainSingle().Which.Provider.Should().Be(SecretProviderType.Azure);
		_createdWithOptions!.Provider.Should().Be(SecretProviderType.Azure);
		_createdWithConfig!.Provider.Should().Be(SecretProviderType.Aws);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReportAwsProvider_When_MapFileDeclaresNoProvider()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		var actual = await sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		actual.Keys.Should().ContainSingle().Which.Provider.Should().Be(SecretProviderType.Aws);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowFileNotFoundException_When_MapFileDoesNotExist()
	{
		// Arrange
		var sut = new EnvilderBuilder(Path.Combine(_directory, "missing.json"));

		// Act
		var act = () => sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		await act.Should().ThrowAsync<FileNotFoundException>().WithMessage("Map file not found: *");
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_PropagateCancellation_When_ProviderCheckIsCanceled()
	{
		// Arrange
		_provider.CheckException = new OperationCanceledException();
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		var act = () => sut.ValidateContractAsync(TestContext.Current.CancellationToken);

		// Assert
		await act.Should().ThrowAsync<OperationCanceledException>();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_PassCancellationTokenToProvider_When_ValidatingContract()
	{
		// Arrange
		using var source = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		await sut.ValidateContractAsync(source.Token);

		// Assert
		_provider.CheckTokens.Should().ContainSingle().Which.Should().Be(source.Token);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_NotCheckContract_When_ContractValidationIsDisabled()
	{
		// Arrange
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		await sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		_provider.CheckCalls.Should().Be(0);
		_provider.GetSecretCalls.Should().Be(1);
	}

	[Fact]
	public void Should_NotCheckContract_When_ContractValidationIsDisabledOnSyncResolve()
	{
		// Arrange
		var sut = CreateSut("""{"DB_URL":"/app/db"}""");

		// Act
		sut.Resolve();

		// Assert
		_provider.CheckCalls.Should().Be(0);
	}

	[Fact]
	public void Should_CheckOnceAndResolve_When_ResolveRunsWithContractValidation()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		var actual = sut.Resolve();

		// Assert
		_provider.CheckCalls.Should().Be(1);
		actual["DB_URL"].Should().Be(FakeCheckingSecretProvider.ResolvedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CheckOnceAndResolve_When_ResolveAsyncRunsWithContractValidation()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		var actual = await sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		_provider.CheckCalls.Should().Be(1);
		actual["DB_URL"].Should().Be(FakeCheckingSecretProvider.ResolvedValue);
	}

	[Fact]
	public void Should_CheckOnceAndInject_When_InjectRunsWithContractValidation()
	{
		// Arrange
		var variable = NewVariable();
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut($$"""{"{{variable}}":"/app/db"}""").WithContractValidation();

		// Act
		sut.Inject();

		// Assert
		_provider.CheckCalls.Should().Be(1);
		Environment.GetEnvironmentVariable(variable).Should().Be(FakeCheckingSecretProvider.ResolvedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_CheckOnceAndInject_When_InjectAsyncRunsWithContractValidation()
	{
		// Arrange
		var variable = NewVariable();
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut($$"""{"{{variable}}":"/app/db"}""").WithContractValidation();

		// Act
		await sut.InjectAsync(TestContext.Current.CancellationToken);

		// Assert
		_provider.CheckCalls.Should().Be(1);
		Environment.GetEnvironmentVariable(variable).Should().Be(FakeCheckingSecretProvider.ResolvedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ReuseSameProvider_When_LoadRunsWithContractValidation()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		await sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		_providersCreated.Should().Be(1);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_PassCancellationTokenToProvider_When_LoadRunsWithContractValidation()
	{
		// Arrange
		using var source = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		await sut.ResolveAsync(source.Token);

		// Assert
		_provider.CheckTokens.Should().ContainSingle().Which.Should().Be(source.Token);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowContractValidationException_When_SecretIsMissingOnResolveAsync()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Missing);
		_provider.Existence["/app/key"] = new(SecretExistenceStatus.AccessDenied);
		_provider.Existence["/app/ok"] = new(SecretExistenceStatus.Exists);
		var sut = CreateSut("""{"DB_URL":"/app/db","API_KEY":"/app/key","OK":"/app/ok"}""")
			.WithContractValidation();

		// Act
		var act = () => sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		var assertion = await act.Should().ThrowAsync<ContractValidationException>();
		assertion.Which.Message.Should().Be(
			"Map file contract validation failed: DB_URL (/app/db): missing, API_KEY (/app/key): access_denied");
		assertion.Which.Result.IsValid.Should().BeFalse();
	}

	[Fact]
	public void Should_ThrowContractValidationException_When_SecretIsMissingOnResolve()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Missing);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		var act = () => sut.Resolve();

		// Assert
		act.Should().Throw<ContractValidationException>()
			.Which.Result.Keys.Should().ContainSingle().Which.Status.Should().Be(SecretExistenceStatus.Missing);
	}

	[Fact]
	public void Should_ThrowContractValidationException_When_SecretIsMissingOnInject()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Missing);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		var act = () => sut.Inject();

		// Assert
		act.Should().Throw<ContractValidationException>();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowContractValidationException_When_SecretIsMissingOnInjectAsync()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Missing);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		var act = () => sut.InjectAsync(TestContext.Current.CancellationToken);

		// Assert
		await act.Should().ThrowAsync<ContractValidationException>();
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_NotResolveAnySecret_When_ContractValidationFails()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Missing);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		var act = () => sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		await act.Should().ThrowAsync<ContractValidationException>();
		_provider.GetSecretCalls.Should().Be(0);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_NameMapFileErrorsInMessage_When_MapFileIsInvalidOnLoad()
	{
		// Arrange
		var sut = CreateSut("""{"$config":{"provider":"gcp"},"A":"/a"}""").WithContractValidation();

		// Act
		var act = () => sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		var assertion = await act.Should().ThrowAsync<ContractValidationException>();
		assertion.Which.Message.Should().Be(
			"Map file contract validation failed: "
			+ "$config.provider: Unsupported provider: gcp. Supported providers: aws, azure.");
		_providersCreated.Should().Be(0);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_NeverIncludeSecretValue_When_ContractValidationFails()
	{
		// Arrange
		_provider.Existence["/app/db"] = new(SecretExistenceStatus.Missing);
		var sut = CreateSut("""{"DB_URL":"/app/db"}""").WithContractValidation();

		// Act
		var act = () => sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		var assertion = await act.Should().ThrowAsync<ContractValidationException>();
		assertion.Which.Message.Should().NotContain(FakeCheckingSecretProvider.ResolvedValue);
	}

	[Fact(Timeout = CancellationTokenForTest.ShortTimeout)]
	public async Task Should_ThrowFileNotFoundException_When_LoadWithContractValidationHasNoMapFile()
	{
		// Arrange
		var sut = new EnvilderBuilder(Path.Combine(_directory, "missing.json")).WithContractValidation();

		// Act
		var act = () => sut.ResolveAsync(TestContext.Current.CancellationToken);

		// Assert
		await act.Should().ThrowAsync<FileNotFoundException>();
	}
}