namespace Envilder.Application;

using global::Envilder.Domain;
using global::Envilder.Infrastructure;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Fluent builder for configuring and resolving secrets from a map file.
/// Obtain an instance via <see cref="Envilder.FromMapFile(string)"/>.
/// </summary>
/// <example>
/// <code>
/// var secrets = Envilder.FromMapFile("param-map.json")
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

	/// <summary>
	/// Overrides the secret provider type specified in the map file's <c>$config</c>.
	/// </summary>
	/// <param name="provider">The provider to use (AWS or Azure).</param>
	/// <returns>This builder for chaining.</returns>
	public EnvilderBuilder WithProvider(SecretProviderType provider)
	{
		_options.Provider = provider;
		return this;
	}

	/// <summary>
	/// Overrides the AWS named profile used for credential resolution.
	/// Only applicable when the provider is AWS.
	/// </summary>
	/// <param name="profile">The AWS profile name.</param>
	/// <returns>This builder for chaining.</returns>
	public EnvilderBuilder WithProfile(string profile)
	{
		_options.Profile = profile;
		return this;
	}

	/// <summary>
	/// Overrides the Azure Key Vault URL used for secret retrieval.
	/// Only applicable when the provider is Azure.
	/// </summary>
	/// <param name="vaultUrl">The Key Vault URL (e.g. <c>https://my-vault.vault.azure.net</c>).</param>
	/// <returns>This builder for chaining.</returns>
	public EnvilderBuilder WithVaultUrl(string vaultUrl)
	{
		_options.VaultUrl = vaultUrl;
		return this;
	}

	/// <summary>
	/// Resolves secrets from the map file using the configured overrides and
	/// returns them as a dictionary, without injecting into the environment.
	/// </summary>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	public IReadOnlyDictionary<string, string> Resolve()
	{
		Envilder.ValidateFileExists(_filePath);
		var json = File.ReadAllText(_filePath);
		var mapFile = new MapFileParser().Parse(json);
		var provider = SecretProviderFactory.Create(mapFile.Config, _options);
		return new Dictionary<string, string>(new EnvilderClient(provider).ResolveSecrets(mapFile));
	}

	/// <summary>
	/// Asynchronously resolves secrets from the map file using the configured overrides.
	/// </summary>
	/// <param name="cancellationToken">Optional cancellation token.</param>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
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

	/// <summary>
	/// Resolves secrets and injects them as process-level environment variables
	/// via <see cref="System.Environment.SetEnvironmentVariable(string, string)"/>.
	/// </summary>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	public IReadOnlyDictionary<string, string> Inject()
	{
		var secrets = Resolve();
		EnvilderClient.InjectIntoEnvironment(secrets);
		return secrets;
	}

	/// <summary>
	/// Asynchronously resolves secrets and injects them as process-level environment variables.
	/// </summary>
	/// <param name="cancellationToken">Optional cancellation token.</param>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	public async Task<IReadOnlyDictionary<string, string>> InjectAsync(
		CancellationToken cancellationToken = default)
	{
		var secrets = await ResolveAsync(cancellationToken).ConfigureAwait(false);
		EnvilderClient.InjectIntoEnvironment(secrets);
		return secrets;
	}
}