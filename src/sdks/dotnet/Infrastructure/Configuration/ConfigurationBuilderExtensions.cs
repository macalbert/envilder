namespace Envilder.Infrastructure.Configuration;

using Envilder.Application;
using Envilder.Domain;
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
	/// resolves every mapping via the provider specified in the file's <c>$config</c>
	/// section, and exposes the results as <see cref="IConfiguration"/> keys.
	/// </summary>
	/// <param name="builder">The configuration builder.</param>
	/// <param name="mapFilePath">Absolute or relative path to the JSON map file.</param>
	/// <param name="options">Optional runtime overrides (provider, profile, vault URL).</param>
	/// <returns>The same <see cref="IConfigurationBuilder"/> for chaining.</returns>
	public static IConfigurationBuilder AddEnvilder(this IConfigurationBuilder builder,
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
		var client = new EnvilderClient(provider);

		return builder.Add(new EnvilderConfigurationSource(client, mapFile));
	}
}