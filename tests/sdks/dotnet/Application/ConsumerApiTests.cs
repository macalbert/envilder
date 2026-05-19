namespace Envilder.Tests.Application;

using AwesomeAssertions;

public class ConsumerApiTests
{
	[Fact]
	public void Should_CompileQualifiedFacadeCalls_When_UsingEnvilderNamespace()
	{
		// Act
		var act = () => Env.Load("nonexistent.json");

		// Assert
		act.Should().Throw<FileNotFoundException>();
	}

	[Fact]
	public void Should_CompileResolveFile_When_UsingEnvilderNamespace()
	{
		// Act
		var act = () => Env.ResolveFile("nonexistent.json");

		// Assert
		act.Should().Throw<FileNotFoundException>();
	}

	[Fact]
	public void Should_ReturnBuilder_When_FromMapFileCalledWithPath()
	{
		// Act
		var builder = Env.FromMapFile("nonexistent.json");

		// Assert
		builder.Should().NotBeNull();
		builder.Should().BeOfType<EnvilderBuilder>();
	}

	[Fact]
	public void Should_CompileBuilderChain_When_UsingFluentApi()
	{
		// Act
		var act = () => Env.FromMapFile("nonexistent.json")
			.WithProvider(SecretProviderType.Aws)
			.WithProfile("default")
			.WithVaultUrl("https://vault.example.com")
			.Resolve();

		// Assert
		act.Should().Throw<FileNotFoundException>();
	}

	[Fact]
	public void Should_CompileValidateSecrets_When_CalledAsExtensionMethod()
	{
		// Arrange
		var secrets = new Dictionary<string, string> { ["KEY"] = "value" };

		// Act
		var act = () => secrets.ValidateSecrets();

		// Assert
		act.Should().NotThrow();
	}

	[Fact]
	public void Should_CompileEnvRouting_When_UsingOverloadWithMapping()
	{
		// Arrange
		var envMapping = new Dictionary<string, string?>
		{
			["production"] = "nonexistent.json",
		};

		// Act
		var act = () => Env.ResolveFile("production", envMapping);

		// Assert
		act.Should().Throw<FileNotFoundException>();
	}

	[Fact]
	public void Should_ReturnIReadOnlyDictionary_When_FacadeMethodsCalled()
	{
		// Arrange
		IReadOnlyDictionary<string, string> result;

		// Act
		var act = () => { result = Env.ResolveFile("nonexistent.json"); };

		// Assert
		act.Should().Throw<FileNotFoundException>();
	}

	[Fact]
	public async Task Should_CompileAsyncVariants_When_UsingAsyncFacade()
	{
		// Act
		var act = () => Env.ResolveFileAsync("nonexistent.json");

		// Assert
		await act.Should().ThrowAsync<FileNotFoundException>();
	}

	[Fact]
	public async Task Should_CompileLoadAsync_When_UsingAsyncFacade()
	{
		// Act
		var act = () => Env.LoadAsync("nonexistent.json");

		// Assert
		await act.Should().ThrowAsync<FileNotFoundException>();
	}
}
