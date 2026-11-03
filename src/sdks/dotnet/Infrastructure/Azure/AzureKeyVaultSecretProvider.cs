namespace Envilder.Infrastructure.Azure;

using global::Azure;
using global::Azure.Identity;
using global::Azure.Security.KeyVault.Secrets;
using global::Envilder.Domain.Ports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// <see cref="ISecretProvider"/> backed by Azure Key Vault.
/// Secrets that return HTTP 404 are treated as missing and yield <see langword="null"/>.
/// Each reference is mapped to its Key Vault name with the same rule the CLI uses.
/// </summary>
public class AzureKeyVaultSecretProvider : ISecretProvider, ISecretExistenceChecker
{
	private readonly SecretClient _secretClient;

	/// <summary>
	/// Initializes a new instance using the supplied Key Vault client.
	/// </summary>
	/// <param name="secretClient">A configured <see cref="SecretClient"/> instance.</param>
	public AzureKeyVaultSecretProvider(SecretClient secretClient)
	{
		_secretClient = secretClient ?? throw new ArgumentNullException(nameof(secretClient));
	}

	/// <inheritdoc />
	public async Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			throw new ArgumentException("Secret name cannot be null or whitespace.", nameof(name));
		}

		try
		{
			var response = await _secretClient.GetSecretAsync(AzureSecretName.From(name), null, cancellationToken);
			return response.Value.Value;
		}
		catch (RequestFailedException ex) when (ex.Status == 404)
		{
			return null;
		}
	}

	/// <inheritdoc />
	public string? GetSecret(string name)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			throw new ArgumentException("Secret name cannot be null or whitespace.", nameof(name));
		}

		try
		{
			using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
			var response = _secretClient.GetSecret(AzureSecretName.From(name), version: null, cancellationToken: cts.Token);
			return response.Value.Value;
		}
		catch (RequestFailedException ex) when (ex.Status == 404)
		{
			return null;
		}
	}

	/// <summary>
	/// Lists the vault's secret properties once, which reads metadata only, and
	/// matches every name against it the way Key Vault does, ignoring case. A
	/// disabled secret cannot be read, so it counts as missing. Needs the
	/// <c>List</c> secret permission (access policies) or
	/// <c>Microsoft.KeyVault/vaults/secrets/readMetadata/action</c> (Azure RBAC,
	/// included in Key Vault Secrets User).
	/// </summary>
	async Task<IReadOnlyDictionary<string, SecretExistence>> ISecretExistenceChecker.CheckSecretsExistAsync(
		IReadOnlyCollection<string> names,
		CancellationToken cancellationToken)
	{
		var distinct = names.Distinct().ToList();
		var results = new Dictionary<string, SecretExistence>();
		if (distinct.Count == 0)
		{
			return results;
		}

		HashSet<string> enabled;
		try
		{
			enabled = await ListEnabledSecretNamesAsync(cancellationToken).ConfigureAwait(false);
		}
		catch (Exception ex)
		{
			// Only the caller's cancellation propagates: a client timeout also surfaces
			// as a canceled task, and is reported as a provider error.
			cancellationToken.ThrowIfCancellationRequested();
			var existence = ToExistence(ex);
			return distinct.ToDictionary(name => name, _ => existence);
		}

		foreach (var name in distinct)
		{
			var secretName = AzureSecretName.From(name);
			results[name] = new(enabled.Contains(secretName)
				? SecretExistenceStatus.Exists
				: SecretExistenceStatus.Missing);
		}

		return results;
	}

	private async Task<HashSet<string>> ListEnabledSecretNamesAsync(CancellationToken cancellationToken)
	{
		var enabled = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
		await foreach (var properties in _secretClient
			.GetPropertiesOfSecretsAsync(cancellationToken)
			.WithCancellation(cancellationToken)
			.ConfigureAwait(false))
		{
			if (properties.Enabled != false)
			{
				enabled.Add(properties.Name);
			}
		}

		return enabled;
	}

	private static SecretExistence ToExistence(Exception exception)
	{
		var reason = ErrorReason.Describe(exception);
		for (var current = exception; current is not null; current = current.InnerException)
		{
			if (current is RequestFailedException { Status: 403 })
			{
				return new(SecretExistenceStatus.AccessDenied, reason);
			}

			if (current is RequestFailedException { Status: 401 } or AuthenticationFailedException)
			{
				return new(SecretExistenceStatus.AuthenticationFailed, reason);
			}
		}

		return new(SecretExistenceStatus.ProviderError, reason);
	}
}