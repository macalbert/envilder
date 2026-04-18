namespace Envilder.Infrastructure.Azure;

using Envilder.Domain.Ports;
using global::Azure;
using global::Azure.Security.KeyVault.Secrets;
using System;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// <see cref="ISecretProvider"/> backed by Azure Key Vault.
/// Secrets that return HTTP 404 are treated as missing and yield <see langword="null"/>.
/// </summary>
public class AzureKeyVaultSecretProvider : ISecretProvider
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
        try
        {
            var response = await _secretClient.GetSecretAsync(name, null, cancellationToken);
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
        try
        {
            var response = _secretClient.GetSecret(name);
            return response.Value.Value;
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }
}
