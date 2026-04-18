namespace Envilder.Application;

using global::Envilder.Domain;
using global::Envilder.Domain.Ports;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Core client that resolves secrets from a configured provider and optionally
/// injects them into the current process environment.
/// </summary>
public class EnvilderClient
{
    private readonly ISecretProvider _secretProvider;

    /// <summary>
    /// Initializes a new <see cref="EnvilderClient"/> backed by the given provider.
    /// </summary>
    /// <param name="secretProvider">The secret store to resolve values from.</param>
    public EnvilderClient(ISecretProvider secretProvider)
    {
        _secretProvider = secretProvider ?? throw new ArgumentNullException(nameof(secretProvider));
    }

    /// <summary>
    /// Sets every key/value pair as a process-level environment variable.
    /// </summary>
    /// <param name="secrets">Resolved secrets to inject.</param>
    public static void InjectIntoEnvironment(IEnumerable<KeyValuePair<string, string>> secrets)
    {
        foreach (var kvp in secrets)
        {
            Environment.SetEnvironmentVariable(kvp.Key, kvp.Value);
        }
    }

    /// <summary>
    /// Resolves all mappings in <paramref name="mapFile"/> against the configured secret provider.
    /// Entries whose secret does not exist in the store are silently omitted from the result.
    /// </summary>
    /// <param name="mapFile">Parsed map file containing the config and variable mappings.</param>
    /// <param name="cancellationToken">Optional cancellation token.</param>
    /// <returns>A dictionary of resolved environment variable name → secret value pairs.</returns>
    public async Task<IDictionary<string, string>> ResolveSecretsAsync(ParsedMapFile mapFile,
                                                                       CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, string>();

        foreach (var entry in mapFile.Mappings)
        {
            var secretValue = await _secretProvider.GetSecretAsync(entry.Value, cancellationToken).ConfigureAwait(false);
            if (secretValue is not null)
            {
                result[entry.Key] = secretValue;
            }
        }

        return result;
    }

    /// <summary>
    /// Resolves all mappings in <paramref name="mapFile"/> against the configured secret provider.
    /// Entries whose secret does not exist in the store are silently omitted from the result.
    /// </summary>
    /// <param name="mapFile">Parsed map file containing the config and variable mappings.</param>
    /// <returns>A dictionary of resolved environment variable name → secret value pairs.</returns>
    public IDictionary<string, string> ResolveSecrets(ParsedMapFile mapFile)
    {
        var result = new Dictionary<string, string>();

        foreach (var entry in mapFile.Mappings)
        {
            var secretValue = _secretProvider.GetSecret(entry.Value);
            if (secretValue is not null)
            {
                result[entry.Key] = secretValue;
            }
        }

        return result;
    }
}