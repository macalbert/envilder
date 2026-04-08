namespace Envilder.Infrastructure.Configuration;

using Envilder.Application;
using Envilder.Domain;
using Microsoft.Extensions.Configuration;
using System;

public class EnvilderConfigurationSource : IConfigurationSource
{
    private readonly EnvilderClient _client;
    private readonly ParsedMapFile _mapFile;

    public EnvilderConfigurationSource(EnvilderClient client, ParsedMapFile mapFile)
    {
        _client = client ?? throw new ArgumentNullException(nameof(client));
        _mapFile = mapFile ?? throw new ArgumentNullException(nameof(mapFile));
    }

    public IConfigurationProvider Build(IConfigurationBuilder builder)
    {
        return new EnvilderConfigurationProvider(_client, _mapFile);
    }
}
