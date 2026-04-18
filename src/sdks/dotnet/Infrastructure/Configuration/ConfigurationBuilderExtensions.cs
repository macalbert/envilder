namespace Envilder.Infrastructure.Configuration;

using Envilder.Application;
using Envilder.Domain.Ports;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

/// <summary>
/// Extension methods for integrating Envilder into the
/// <see cref="IConfigurationBuilder"/> pipeline.
/// </summary>
public static class ConfigurationBuilderExtensions
{
	/// <summary>
	/// Adds an Envilder configuration source that reads a JSON map file from disk,
	/// resolves every mapping against the given <paramref name="secretProvider"/>,
	/// and exposes the results as <see cref="IConfiguration"/> keys.
	/// </summary>
	/// <param name="builder">The configuration builder.</param>
	/// <param name="mapFilePath">Absolute or relative path to the JSON map file.</param>
	/// <param name="secretProvider">The secret provider to resolve values from.</param>
	/// <returns>The same <see cref="IConfigurationBuilder"/> for chaining.</returns>
	/// <exception cref="ArgumentException"><paramref name="mapFilePath"/> is null or empty.</exception>
	/// <exception cref="FileNotFoundException">The map file does not exist on disk.</exception>
	public static IConfigurationBuilder AddEnvilder(this IConfigurationBuilder builder,
													string mapFilePath,
													ISecretProvider secretProvider)
	{
		if (secretProvider is null)
		{
			throw new ArgumentNullException(nameof(secretProvider));
		}

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