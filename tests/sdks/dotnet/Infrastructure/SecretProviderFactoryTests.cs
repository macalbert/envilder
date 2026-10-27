namespace Envilder.Tests.Infrastructure;

using AwesomeAssertions;
using Envilder.Infrastructure;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;
using Envilder.Tests.Fixtures;

[Collection(nameof(ContainersCollection))]
public class SecretProviderFactoryTests : IDisposable
{
	private readonly List<(string Name, string? Value)> _savedEnvVars = [];
	private string? _tempDirToDelete;

	public void Dispose()
	{
		foreach (var (name, value) in _savedEnvVars)
		{
			Environment.SetEnvironmentVariable(name, value);
		}

		if (_tempDirToDelete is not null && Directory.Exists(_tempDirToDelete))
		{
			Directory.Delete(_tempDirToDelete, true);
		}
	}

	[Fact]
	public void Should_SelectAwsProvider_When_NoProviderSpecified()
	{
		// Arrange
		var config = new MapFileConfig();

		// Act
		var actual = SecretProviderFactory.Create(config);

		// Assert
		actual.Should().BeOfType<AwsSsmSecretProvider>();
	}

	[Fact]
	public void Should_SelectAzureProvider_When_ConfigSpecifiesAzure()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "https://my-vault.vault.azure.net",
		};

		// Act
		var actual = SecretProviderFactory.Create(config);

		// Assert
		actual.Should().BeOfType<AzureKeyVaultSecretProvider>();
	}

	[Fact]
	public void Should_OverrideConfigWithOptions_When_BothProvided()
	{
		// Arrange
		var config = new MapFileConfig { Provider = SecretProviderType.Aws };
		var options = new EnvilderOptions
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "https://override-vault.vault.azure.net",
		};

		// Act
		var actual = SecretProviderFactory.Create(config, options);

		// Assert
		actual.Should().BeOfType<AzureKeyVaultSecretProvider>();
	}

	[Fact]
	public void Should_RequireVaultUrl_When_AzureProviderSelected()
	{
		// Arrange
		var config = new MapFileConfig { Provider = SecretProviderType.Azure };

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("*Vault URL*");
	}

	[Fact]
	public void Should_RejectVaultUrl_When_SchemeIsNotHttps()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "http://my-vault.vault.azure.net",
		};

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("vaultUrl must use https:// protocol.");
	}

	[Theory]
	[InlineData("https://attacker.example.com")]
	[InlineData("https://my-vault.vault.azure.net.attacker.example.com")]
	[InlineData("https://my-vaultvault.azure.net")]
	[InlineData("https://kv-test.localhost.localstack.cloud:4566")]
	public void Should_RejectVaultUrl_When_HostIsNotAllowed(string vaultUrl)
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = vaultUrl,
		};

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("vaultUrl hostname must end with one of:*");
	}

	[Fact]
	public void Should_RejectVaultUrl_When_UrlContainsUserInformation()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "https://attacker.example.com@my-vault.vault.azure.net",
		};

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("vaultUrl must not contain user information.");
	}

	[Fact]
	public void Should_AcceptCustomVaultHost_When_AllowedThroughOptions()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "https://kv-test.localhost.localstack.cloud:4566",
		};
		var options = new EnvilderOptions { AllowedVaultHosts = [".localhost.localstack.cloud"] };

		// Act
		var actual = SecretProviderFactory.Create(config, options);

		// Assert
		actual.Should().BeOfType<AzureKeyVaultSecretProvider>();
	}

	[Fact]
	public void Should_KeepChallengeResourceVerification_When_VaultHostIsDefault()
	{
		// Arrange
		var vaultUri = new Uri("https://my-vault.vault.microsoftazure.de");

		// Act
		var actual = SecretProviderFactory.CreateSecretClientOptions(vaultUri);

		// Assert
		actual.DisableChallengeResourceVerification.Should().BeFalse();
	}

	[Fact]
	public void Should_DisableChallengeResourceVerification_When_VaultHostIsCustom()
	{
		// Arrange
		var vaultUri = new Uri("https://kv-test.localhost.localstack.cloud:4566");

		// Act
		var actual = SecretProviderFactory.CreateSecretClientOptions(vaultUri);

		// Assert
		actual.DisableChallengeResourceVerification.Should().BeTrue();
	}

	[Fact]
	public void Should_ThrowArgumentNullException_When_ConfigIsNull()
	{
		// Act
		var act = () => SecretProviderFactory.Create(null!);

		// Assert
		act.Should().Throw<ArgumentNullException>()
			.And.ParamName.Should().Be("config");
	}

	[Fact]
	public void Should_ThrowInvalidOperationException_When_AzureProviderHasProfile()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "https://my-vault.vault.azure.net",
			Profile = "my-profile",
		};

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("*profile*Azure*");
	}

	[Fact]
	public void Should_ThrowInvalidOperationException_When_AzureProviderHasProfileViaOptions()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Azure,
			VaultUrl = "https://my-vault.vault.azure.net",
		};
		var options = new EnvilderOptions { Profile = "my-profile" };

		// Act
		var act = () => SecretProviderFactory.Create(config, options);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("*profile*Azure*");
	}

	[Fact]
	public void Should_ThrowInvalidOperationException_When_AwsProviderHasVaultUrl()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Aws,
			VaultUrl = "https://my-vault.vault.azure.net",
		};

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("*Vault URL*AWS*");
	}

	[Fact]
	public void Should_ThrowInvalidOperationException_When_AwsProviderHasVaultUrlViaOptions()
	{
		// Arrange
		var config = new MapFileConfig();
		var options = new EnvilderOptions
		{
			VaultUrl = "https://my-vault.vault.azure.net",
		};

		// Act
		var act = () => SecretProviderFactory.Create(config, options);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("*Vault URL*AWS*");
	}

	[Fact]
	public void Should_ThrowInvalidOperationException_When_AwsProfileNotFound()
	{
		// Arrange
		var config = new MapFileConfig
		{
			Provider = SecretProviderType.Aws,
			Profile = "nonexistent-profile-12345",
		};

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().Throw<InvalidOperationException>()
			.WithMessage("*profile*nonexistent-profile-12345*");
	}

	[Fact]
	public void Should_SelectAwsProvider_When_NoAwsRegionConfigured()
	{
		// Arrange
		_tempDirToDelete = Path.Combine(Path.GetTempPath(), $"envilder-test-{Guid.NewGuid()}");
		Directory.CreateDirectory(_tempDirToDelete);

		OverrideEnvironmentVariable("AWS_DEFAULT_REGION", null);
		OverrideEnvironmentVariable("AWS_REGION", null);
		OverrideEnvironmentVariable("AWS_PROFILE", null);
		OverrideEnvironmentVariable("AWS_CONFIG_FILE", Path.Combine(_tempDirToDelete, "config"));
		OverrideEnvironmentVariable("AWS_SHARED_CREDENTIALS_FILE", Path.Combine(_tempDirToDelete, "credentials"));
		OverrideEnvironmentVariable("USERPROFILE", _tempDirToDelete);
		OverrideEnvironmentVariable("HOME", _tempDirToDelete);
		var config = new MapFileConfig();

		// Act
		var act = () => SecretProviderFactory.Create(config);

		// Assert
		act.Should().NotThrow()
			.Subject.Should().BeOfType<AwsSsmSecretProvider>();
	}

	private void OverrideEnvironmentVariable(string name, string? value)
	{
		_savedEnvVars.Add((name, Environment.GetEnvironmentVariable(name)));
		Environment.SetEnvironmentVariable(name, value);
	}
}