namespace Envilder.Application;

using global::Envilder.Domain;
using global::Envilder.Infrastructure;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Fluent builder for configuring and resolving secrets from a map file.
/// Obtain an instance via <see cref="Envilder.FromFile(string)"/>.
/// </summary>
/// <example>
/// <code>
/// var secrets = Envilder.FromFile("param-map.json")
///     .WithProvider(SecretProviderType.Azure)
///     .WithVaultUrl("https://my-vault.vault.azure.net")
///     .Resolve();
/// </code>
/// </example>
public class EnvilderBuilder
{
	private readonly string _filePath;
	private readonly EnvilderOptions _options = new();

	internal EnvilderBuilder(string filePath)
	{
		_filePath = filePath;
	}

	public EnvilderBuilder WithProvider(SecretProviderType provider)
	{
		_options.Provider = provider;
		return this;
	}

	public EnvilderBuilder WithProfile(string profile)
	{
		_options.Profile = profile;
		return this;
	}

	public EnvilderBuilder WithVaultUrl(string vaultUrl)
	{
		_options.VaultUrl = vaultUrl;
		return this;
	}

	public IReadOnlyDictionary<string, string> Resolve()
	{
		Envilder.ValidateFileExists(_filePath);
		var json = File.ReadAllText(_filePath);
		var mapFile = new MapFileParser().Parse(json);
		var provider = SecretProviderFactory.Create(mapFile.Config, _options);
		return new Dictionary<string, string>(new EnvilderClient(provider).ResolveSecrets(mapFile));
	}

	public async Task<IReadOnlyDictionary<string, string>> ResolveAsync(
		CancellationToken cancellationToken = default)
	{
		Envilder.ValidateFileExists(_filePath);
		var json = await Envilder.ReadFileAsync(_filePath, cancellationToken).ConfigureAwait(false);
		var mapFile = new MapFileParser().Parse(json);
		var provider = SecretProviderFactory.Create(mapFile.Config, _options);
		var secrets = await new EnvilderClient(provider).ResolveSecretsAsync(mapFile, cancellationToken).ConfigureAwait(false);
		return new Dictionary<string, string>(secrets);
	}

	public IReadOnlyDictionary<string, string> Inject()
	{
		var secrets = Resolve();
		EnvilderClient.InjectIntoEnvironment(secrets);
		return secrets;
	}

	public async Task<IReadOnlyDictionary<string, string>> InjectAsync(
		CancellationToken cancellationToken = default)
	{
		var secrets = await ResolveAsync(cancellationToken).ConfigureAwait(false);
		EnvilderClient.InjectIntoEnvironment(secrets);
		return secrets;
	}
}