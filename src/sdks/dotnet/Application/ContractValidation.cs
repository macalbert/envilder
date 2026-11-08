namespace Envilder;

using global::Envilder.Domain.Ports;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

internal static class ContractValidation
{
	private const string NoResultReason = "The provider returned no result for this secret.";

	/// <summary>The result for a map file that failed validation: no provider was called.</summary>
	public static ContractValidationResult InvalidMapFile(IReadOnlyList<MapFileError> mapFileErrors)
	{
		return new(mapFileErrors, []);
	}

	/// <summary>
	/// Checks that every secret path declared in a valid map file exists,
	/// without reading any value. A path shared by several variables is checked
	/// once. Returns one check per variable, in map-file order.
	/// </summary>
	public static async Task<ContractValidationResult> CheckRemoteKeysAsync(
		ParsedMapFile mapFile,
		ISecretExistenceChecker checker,
		SecretProviderType provider,
		CancellationToken cancellationToken)
	{
		var mappings = mapFile.Mappings.ToList();
		var existence = mappings.Count == 0
			? new Dictionary<string, SecretExistence>()
			: await checker.CheckSecretsExistAsync(
				mappings.Select(mapping => mapping.Value).Distinct().ToList(),
				cancellationToken).ConfigureAwait(false);

		var keys = mappings
			.Select(mapping => ToKeyCheck(mapping.Key, mapping.Value, provider, existence))
			.ToList();
		return new([], keys);
	}

	/// <summary>
	/// The result for a provider that cannot check existence (a custom one
	/// that does not implement <see cref="ISecretExistenceChecker"/>): every
	/// key is a provider error.
	/// </summary>
	public static ContractValidationResult NotCheckable(ParsedMapFile mapFile, SecretProviderType provider)
	{
		return EveryKey(
			mapFile,
			provider,
			SecretExistenceStatus.ProviderError,
			"The provider cannot check whether a secret exists.");
	}

	/// <summary>
	/// The result when the provider cannot be built because the AWS profile is
	/// not in the credential store: no key can be checked with those credentials.
	/// </summary>
	public static ContractValidationResult ProfileNotFound(
		ParsedMapFile mapFile,
		SecretProviderType provider,
		string reason)
	{
		return EveryKey(mapFile, provider, SecretExistenceStatus.AuthenticationFailed, reason);
	}

	private static ContractValidationResult EveryKey(
		ParsedMapFile mapFile,
		SecretProviderType provider,
		SecretExistenceStatus status,
		string reason)
	{
		var keys = mapFile.Mappings
			.Select(mapping => new KeyCheck(mapping.Key, mapping.Value, provider, status, reason))
			.ToList();
		return new([], keys);
	}

	private static KeyCheck ToKeyCheck(
		string variable,
		string path,
		SecretProviderType provider,
		IReadOnlyDictionary<string, SecretExistence> existence)
	{
		return existence.TryGetValue(path, out var found)
			? new(variable, path, provider, found.Status, found.Reason)
			: new(variable, path, provider, SecretExistenceStatus.ProviderError, NoResultReason);
	}
}