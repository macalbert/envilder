using System;
using Envilder.Application;
using Envilder.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace Envilder.Infrastructure;

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
