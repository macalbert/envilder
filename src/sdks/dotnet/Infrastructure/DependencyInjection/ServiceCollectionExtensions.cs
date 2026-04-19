namespace Envilder.Infrastructure.DependencyInjection;

using Envilder.Application;
using Envilder.Domain;
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
	/// <see cref="EnvilderClient"/> backed by the provider from <c>$config</c>,
	/// and registers both the client and the parsed map file as singletons.
	/// </summary>
	/// <param name="services">The service collection.</param>
	/// <param name="mapFilePath">Path to the JSON map file on disk.</param>
	/// <param name="options">Optional runtime overrides (provider, profile, vault URL).</param>
	/// <returns>The same <see cref="IServiceCollection"/> for chaining.</returns>
	public static IServiceCollection AddEnvilder(this IServiceCollection services,
												 string mapFilePath,
												 EnvilderOptions? options = null)
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
		var provider = SecretProviderFactory.Create(mapFile.Config, options);

		services.AddSingleton(mapFile);
		services.AddSingleton(new EnvilderClient(provider));

		return services;
	}
}