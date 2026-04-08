namespace Envilder.Infrastructure.Configuration;

using Envilder.Application;
using Envilder.Domain;
using Microsoft.Extensions.Configuration;
using System;

public class EnvilderConfigurationProvider : ConfigurationProvider
{
    private readonly EnvilderClient _client;
    private readonly ParsedMapFile _mapFile;

    public EnvilderConfigurationProvider(EnvilderClient client, ParsedMapFile mapFile)
    {
        _client = client ?? throw new ArgumentNullException(nameof(client));
        _mapFile = mapFile ?? throw new ArgumentNullException(nameof(mapFile));
    }

    // ConfigurationProvider.Load() is synchronous by design.
    // ResolveSecretsAsync uses ConfigureAwait(false) throughout to avoid deadlocks.
    public override void Load()
    {
        var secrets = _client.ResolveSecretsAsync(_mapFile)
            .ConfigureAwait(false)
            .GetAwaiter()
            .GetResult();

        Data.Clear();

        foreach (var kvp in secrets)
        {
            var key = NormalizeKey(kvp.Key);
            Data[key] = kvp.Value;
        }
    }

    private static string NormalizeKey(string key)
    {
        return key.Replace("/", ConfigurationPath.KeyDelimiter);
    }
}