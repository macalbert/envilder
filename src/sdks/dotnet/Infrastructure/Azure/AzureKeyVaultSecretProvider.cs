namespace Envilder.Infrastructure.Azure;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Azure;
using global::Azure.Security.KeyVault.Secrets;
using Envilder.Domain.Ports;

public class AzureKeyVaultSecretProvider : ISecretProvider
{
    private readonly SecretClient _secretClient;

    public AzureKeyVaultSecretProvider(SecretClient secretClient)
    {
        _secretClient = secretClient;
    }

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
}
