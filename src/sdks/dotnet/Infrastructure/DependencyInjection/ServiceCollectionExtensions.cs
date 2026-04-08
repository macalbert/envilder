namespace Envilder.Infrastructure.DependencyInjection;

using Envilder.Application;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;

/// <summary>
/// Extension methods for registering Envilder services in an
/// <see cref="IServiceCollection"/> dependency injection container.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Parses the map file at <paramref name="mapFilePath"/>, creates an
    /// <see cref="EnvilderClient"/> backed by <paramref name="secretProvider"/>,
    /// and registers both the client and the parsed <see cref="ParsedMapFile"/>
    /// as singleton services.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="mapFilePath">Path to the JSON map file on disk.</param>
    /// <param name="secretProvider">The secret provider to resolve values from.</param>
    /// <returns>The same <see cref="IServiceCollection"/> for chaining.</returns>
    /// <exception cref="ArgumentException"><paramref name="mapFilePath"/> is null or empty.</exception>
    /// <exception cref="FileNotFoundException">The map file does not exist on disk.</exception>
    public static IServiceCollection AddEnvilder(this IServiceCollection services,
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

        //services.AddSingleton(new MapFileParser().Parse(json));
        services.AddSingleton(new EnvilderClient(secretProvider));

        return services;
    }
}