namespace Envilder.Application;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Envilder.Domain;
using Envilder.Domain.Ports;

public class EnvilderClient
{
    private readonly ISecretProvider _secretProvider;

    public EnvilderClient(ISecretProvider secretProvider)
    {
        _secretProvider = secretProvider;
    }

    public static void InjectIntoEnvironment(IDictionary<string, string> secrets)
    {
        foreach (var kvp in secrets)
        {
            Environment.SetEnvironmentVariable(kvp.Key, kvp.Value);
        }
    }

    public async Task<IDictionary<string, string>> ResolveSecretsAsync(
        ParsedMapFile mapFile,
        CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, string>();

        foreach (var entry in mapFile.Mappings)
        {
            var secretValue = await _secretProvider.GetSecretAsync(entry.Value, cancellationToken);
            if (secretValue is not null)
            {
                result[entry.Key] = secretValue;
            }
        }

        return result;
    }
}
