namespace Envilder.Infrastructure.DependencyInjection;

using Envilder.Application;
using Envilder.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

/// <summary>
/// Extension methods for registering Envilder services in an
/// <see cref="IServiceCollection"/> dependency injection container.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers an <see cref="EnvilderClient"/> as a singleton service
    /// backed by the given <paramref name="secretProvider"/>.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="mapFilePath">Path to the JSON map file on disk.</param>
    /// <param name="secretProvider">The secret provider to resolve values from.</param>
    /// <returns>The same <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddEnvilder(
        this IServiceCollection services,
        string mapFilePath,
        ISecretProvider secretProvider)
    {
        services.AddSingleton(new EnvilderClient(secretProvider));
        return services;
    }
}
