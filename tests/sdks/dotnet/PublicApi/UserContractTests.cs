// The user contract: this file declares ONLY `using Envilder;` for the SDK.
// If any public entry point moves into Envilder.Application, Envilder.Domain or
// Envilder.Infrastructure, this file stops compiling and the build fails.
//
// The namespace intentionally lives outside `Envilder.*`: a nested namespace
// would resolve SDK types implicitly through its parents, so the test would
// still pass with the `using Envilder;` removed and prove nothing.
namespace UserContract;

using AwesomeAssertions;
using Envilder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public class UserContractTests
{
	[Fact]
	public void Should_CompileWithSingleUsing_When_UserResolvesSecretsFromMapFile()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = () => Env.ResolveFile(mapFilePath);

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserLoadsSecretsIntoEnvironment()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = () => Env.Load(mapFilePath);

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserResolvesSecretsAsynchronously()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = async () => await Env.ResolveFileAsync(mapFilePath, TestContext.Current.CancellationToken);

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserLoadsSecretsAsynchronously()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = async () => await Env.LoadAsync(mapFilePath, TestContext.Current.CancellationToken);

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserRoutesSecretsByEnvironment()
	{
		// Arrange
		var envMapping = new Dictionary<string, string?>
		{
			["Development"] = "envilder.json",
			["Production"] = "envilder.json",
			["test"] = null,
		};

		// Act
		var act = () => Env.Load("Production", envMapping);

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserOverridesProviderWithFluentBuilder()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = () => Env.FromMapFile(mapFilePath)
			.WithProvider(SecretProviderType.Azure)
			.WithVaultUrl("https://my-vault.vault.azure.net")
			.Resolve();

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserOverridesProfileWithFluentBuilder()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = () => Env.FromMapFile(mapFilePath)
			.WithProfile("default")
			.Inject();

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserValidatesResolvedSecrets()
	{
		// Arrange
		var secrets = new Dictionary<string, string> { ["DB_URL"] = "postgres://localhost" };

		// Act
		var act = () => ((IReadOnlyDictionary<string, string>)secrets).ValidateSecrets();

		// Assert
		act.Should().NotThrow<SecretValidationException>();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserParsesMapFileManually()
	{
		// Arrange
		var json = """{"$config":{"provider":"aws"},"DB_URL":"/app/db-url"}""";

		// Act
		var actual = new MapFileParser().Parse(json);

		// Assert
		actual.Mappings.Should().ContainKey("DB_URL");
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserBuildsProviderOptions()
	{
		// Arrange
		MapFileConfig config = new() { Provider = SecretProviderType.Aws };

		// Act
		EnvilderOptions actual = new() { Provider = config.Provider, Profile = "default" };

		// Assert
		actual.Provider.Should().Be(SecretProviderType.Aws);
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserAddsEnvilderToConfiguration()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = () => new ConfigurationBuilder().AddEnvilder(mapFilePath).Build();

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserAddsEnvilderToServiceCollection()
	{
		// Arrange
		var mapFilePath = "envilder.json";

		// Act
		var act = () => new ServiceCollection()
			.AddEnvilder(mapFilePath, new EnvilderOptions { Profile = "default" })
			.BuildServiceProvider()
			.GetRequiredService<ParsedMapFile>();

		// Assert
		act.Should().NotBeNull();
	}

	[Fact]
	public void Should_CompileWithSingleUsing_When_UserResolvesSecretsWithClientDirectly()
	{
		// Arrange
		var mapFile = new MapFileParser().Parse("""{"$config":{"provider":"aws"},"DB_URL":"/app/db-url"}""");

		// Act
		var act = () => new ServiceCollection()
			.AddEnvilder("envilder.json")
			.BuildServiceProvider()
			.GetRequiredService<EnvilderClient>()
			.ResolveSecrets(mapFile);

		// Assert
		act.Should().NotBeNull();
	}
}