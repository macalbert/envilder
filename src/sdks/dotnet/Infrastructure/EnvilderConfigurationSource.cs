using Envilder.Application;
using Envilder.Domain;
using Microsoft.Extensions.Configuration;

namespace Envilder.Infrastructure;

public class EnvilderConfigurationSource : IConfigurationSource
{
    private readonly EnvilderClient _client;
    private readonly ParsedMapFile _mapFile;

    public EnvilderConfigurationSource(EnvilderClient client, ParsedMapFile mapFile)
    {
        _client = client;
        _mapFile = mapFile;
    }

    public IConfigurationProvider Build(IConfigurationBuilder builder)
    {
        return new EnvilderConfigurationProvider(_client, _mapFile);
    }
}
