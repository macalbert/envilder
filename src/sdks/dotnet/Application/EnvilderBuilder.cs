namespace Envilder;

using global::Envilder.Domain.Ports;
using global::Envilder.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Fluent builder for configuring and resolving secrets from a map file.
/// Obtain an instance via <see cref="Env.FromMapFile(string)"/>.
/// </summary>
/// <example>
/// <code>
/// var secrets = Env.FromMapFile("envilder.json")
///     .WithProvider(SecretProviderType.Azure)
///     .WithVaultUrl("https://my-vault.vault.azure.net")
///     .Resolve();
/// </code>
/// </example>
public class EnvilderBuilder
{
	private readonly string _filePath;
	private readonly EnvilderOptions _options = new();
	private readonly Func<MapFileConfig, EnvilderOptions, ISecretProvider> _createProvider;
	private bool _contractValidation;

	internal EnvilderBuilder(string filePath)
		: this(filePath, static (config, options) => SecretProviderFactory.Create(config, options))
	{
	}

	internal EnvilderBuilder(
		string filePath,
		Func<MapFileConfig, EnvilderOptions, ISecretProvider> createProvider)
	{
		_filePath = filePath;
		_createProvider = createProvider;
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
	/// Runs <see cref="ValidateContractAsync"/> once before every load
	/// (<see cref="Resolve"/>, <see cref="ResolveAsync"/>, <see cref="Inject"/>,
	/// <see cref="InjectAsync"/>) and fails the load with a
	/// <see cref="ContractValidationException"/> when it does not pass. Off by
	/// default: without it, a load makes no extra provider call.
	/// </summary>
	/// <returns>This builder for chaining.</returns>
	public EnvilderBuilder WithContractValidation()
	{
		_contractValidation = true;
		return this;
	}

	/// <summary>
	/// Checks the map file contract without reading any secret value: the map
	/// file matches <c>spec/map-file.v1.json</c> and the provider configuration
	/// it resolves to is coherent, and every declared secret exists. Expected
	/// failures (invalid map file, missing secret, access denied, rejected
	/// credentials, provider errors) are reported in the result, not thrown.
	/// When the map file is invalid, no provider is created or called.
	/// </summary>
	/// <param name="cancellationToken">Optional cancellation token, observed by every provider call.</param>
	/// <returns>The outcome of the check.</returns>
	/// <exception cref="FileNotFoundException">When the map file does not exist.</exception>
	/// <exception cref="OperationCanceledException">When <paramref name="cancellationToken"/> is canceled.</exception>
	public async Task<ContractValidationResult> ValidateContractAsync(
		CancellationToken cancellationToken = default)
	{
		Env.ValidateFileExists(_filePath);
		var json = await Env.ReadFileAsync(_filePath, cancellationToken).ConfigureAwait(false);
		var check = await CheckContractAsync(json, cancellationToken).ConfigureAwait(false);
		return check.Result;
	}

	/// <summary>
	/// Resolves secrets from the map file using the configured overrides and
	/// returns them as a dictionary, without injecting into the environment.
	/// </summary>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	public IReadOnlyDictionary<string, string> Resolve()
	{
		Env.ValidateFileExists(_filePath);
		var json = File.ReadAllText(_filePath);
		if (_contractValidation)
		{
			using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
#pragma warning disable VSTHRD002 // The sync API has no async counterpart to await
			var check = Task.Run(() => CheckContractAsync(json, cts.Token)).GetAwaiter().GetResult();
#pragma warning restore VSTHRD002
			return new Dictionary<string, string>(
				new EnvilderClient(check.RequireProvider()).ResolveSecrets(check.MapFile!));
		}

		var mapFile = new MapFileParser().Parse(json);
		var provider = _createProvider(mapFile.Config, _options);
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
		Env.ValidateFileExists(_filePath);
		var json = await Env.ReadFileAsync(_filePath, cancellationToken).ConfigureAwait(false);
		if (_contractValidation)
		{
			var check = await CheckContractAsync(json, cancellationToken).ConfigureAwait(false);
			var validated = await new EnvilderClient(check.RequireProvider())
				.ResolveSecretsAsync(check.MapFile!, cancellationToken).ConfigureAwait(false);
			return new Dictionary<string, string>(validated);
		}

		var mapFile = new MapFileParser().Parse(json);
		var provider = _createProvider(mapFile.Config, _options);
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

	/// <summary>
	/// Validates the map file and, when it is valid, checks every declared key
	/// with the provider a load would use, which is returned for that load.
	/// </summary>
	private async Task<ContractCheck> CheckContractAsync(string json, CancellationToken cancellationToken)
	{
		var mapFileErrors = MapFileValidator.ValidateContent(json, _options);
		if (mapFileErrors.Count > 0)
		{
			return new(ContractValidation.InvalidMapFile(mapFileErrors), null, null);
		}

		var mapFile = new MapFileParser().Parse(json);
		var provider = _createProvider(mapFile.Config, _options);
		var providerType = _options.Provider ?? mapFile.Config.Provider ?? SecretProviderType.Aws;
		var result = provider is ISecretExistenceChecker checker
			? await ContractValidation
				.CheckRemoteKeysAsync(mapFile, checker, providerType, cancellationToken)
				.ConfigureAwait(false)
			: ContractValidation.NotCheckable(mapFile, providerType);
		return new(result, mapFile, provider);
	}

	private sealed class ContractCheck
	{
		public ContractCheck(ContractValidationResult result, ParsedMapFile? mapFile, ISecretProvider? provider)
		{
			Result = result;
			MapFile = mapFile;
			Provider = provider;
		}

		public ContractValidationResult Result { get; }

		public ParsedMapFile? MapFile { get; }

		private ISecretProvider? Provider { get; }

		public ISecretProvider RequireProvider()
		{
			if (!Result.IsValid || Provider is null)
			{
				throw new ContractValidationException(Result);
			}

			return Provider;
		}
	}
}