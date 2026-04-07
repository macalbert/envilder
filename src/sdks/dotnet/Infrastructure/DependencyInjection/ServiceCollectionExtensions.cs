namespace Envilder.Infrastructure.DependencyInjection;

using System;
using Envilder.Application;
using Envilder.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddEnvilder(
        this IServiceCollection services,
        string mapFilePath,
        ISecretProvider secretProvider)
    {
        services.AddSingleton(new EnvilderClient(secretProvider));
        return services;
    }
}
