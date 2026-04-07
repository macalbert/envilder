namespace Envilder.Infrastructure.Configuration;

using System;
using Envilder.Application;
using Envilder.Domain;
using Microsoft.Extensions.Configuration;

public class EnvilderConfigurationProvider : ConfigurationProvider
{
    private readonly EnvilderClient _client;
    private readonly ParsedMapFile _mapFile;

    public EnvilderConfigurationProvider(EnvilderClient client, ParsedMapFile mapFile)
    {
        _client = client;
        _mapFile = mapFile;
    }

    public override void Load()
    {
        var secrets = _client.ResolveSecretsAsync(_mapFile).GetAwaiter().GetResult();
        foreach (var kvp in secrets)
        {
            Data[kvp.Key] = kvp.Value;
        }
    }
}
