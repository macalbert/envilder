namespace Envilder.Infrastructure.Configuration;

using Envilder.Application;
using Envilder.Domain.Ports;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

public static class ConfigurationBuilderExtensions
{
    public static IConfigurationBuilder AddEnvilder(this IConfigurationBuilder builder,
                                                    string mapFilePath,
                                                    ISecretProvider secretProvider)
    {
        if (string.IsNullOrWhiteSpace(mapFilePath))
        {
            throw new ArgumentException("Map file path cannot be null or empty.", nameof(mapFilePath));
        }

        if (!File.Exists(mapFilePath))
        {
            throw new FileNotFoundException("Map file not found.", mapFilePath);
        }

        var json = File.ReadAllText(mapFilePath);
        var mapFile = new MapFileParser().Parse(json);
        var client = new EnvilderClient(secretProvider);

        return builder.Add(new EnvilderConfigurationSource(client, mapFile));
    }
}