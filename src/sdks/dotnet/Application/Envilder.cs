namespace Envilder.Application;

using global::Envilder.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// One-liner facade for resolving and injecting secrets from a map file.
/// <para>
/// Use <see cref="ResolveFile(string)"/> to resolve secrets, <see cref="Load(string)"/>
/// to resolve and inject into <see cref="System.Environment"/>, or
/// <see cref="FromMapFile(string)"/> for fluent configuration.
/// </para>
/// </summary>
/// <example>
/// <code>
/// // Resolve + inject in one call
/// Envilder.Load("param-map.json");
///
/// // Resolve without injecting
/// var secrets = Envilder.ResolveFile("param-map.json");
///
/// // Fluent builder with provider override
/// var secrets = Envilder.FromMapFile("param-map.json")
///     .WithProvider(SecretProviderType.Azure)
///     .WithVaultUrl("https://my-vault.vault.azure.net")
///     .Resolve();
/// </code>
/// </example>
public static class Envilder
{
	/// <summary>
	/// Reads the map file at <paramref name="filePath"/>, resolves every secret from
	/// the configured provider, and returns the results as a dictionary.
	/// </summary>
	/// <param name="filePath">Path to the JSON map file on disk.</param>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	/// <exception cref="ArgumentException">When <paramref name="filePath"/> is null or whitespace.</exception>
	/// <exception cref="FileNotFoundException">When the file does not exist.</exception>
	public static IReadOnlyDictionary<string, string> ResolveFile(string filePath)
	{
		ValidateFilePath(filePath);
		var json = File.ReadAllText(filePath);
		var parser = new MapFileParser();
		var mapFile = parser.Parse(json);
		var provider = SecretProviderFactory.Create(mapFile.Config);
		var client = new EnvilderClient(provider);
		return new Dictionary<string, string>(client.ResolveSecrets(mapFile));
	}

	/// <summary>
	/// Asynchronously reads the map file at <paramref name="filePath"/>, resolves every
	/// secret from the configured provider, and returns the results as a dictionary.
	/// </summary>
	/// <param name="filePath">Path to the JSON map file on disk.</param>
	/// <param name="cancellationToken">Optional cancellation token.</param>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	/// <exception cref="ArgumentException">When <paramref name="filePath"/> is null or whitespace.</exception>
	/// <exception cref="FileNotFoundException">When the file does not exist.</exception>
	public static async Task<IReadOnlyDictionary<string, string>> ResolveFileAsync(
		string filePath,
		CancellationToken cancellationToken = default)
	{
		ValidateFilePath(filePath);
		var json = await ReadFileAsync(filePath, cancellationToken).ConfigureAwait(false);
		var parser = new MapFileParser();
		var mapFile = parser.Parse(json);
		var provider = SecretProviderFactory.Create(mapFile.Config);
		var client = new EnvilderClient(provider);
		var secrets = await client.ResolveSecretsAsync(mapFile, cancellationToken).ConfigureAwait(false);
		return new Dictionary<string, string>(secrets);
	}

	/// <summary>
	/// Resolves secrets from the map file and injects them as process-level
	/// environment variables via <see cref="System.Environment.SetEnvironmentVariable(string, string)"/>.
	/// </summary>
	/// <param name="filePath">Path to the JSON map file on disk.</param>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	/// <exception cref="ArgumentException">When <paramref name="filePath"/> is null or whitespace.</exception>
	/// <exception cref="FileNotFoundException">When the file does not exist.</exception>
	public static IReadOnlyDictionary<string, string> Load(string filePath)
	{
		var secrets = ResolveFile(filePath);
		EnvilderClient.InjectIntoEnvironment(secrets);
		return secrets;
	}

	/// <summary>
	/// Asynchronously resolves secrets from the map file and injects them as
	/// process-level environment variables.
	/// </summary>
	/// <param name="filePath">Path to the JSON map file on disk.</param>
	/// <param name="cancellationToken">Optional cancellation token.</param>
	/// <returns>Resolved secrets keyed by environment variable name.</returns>
	/// <exception cref="ArgumentException">When <paramref name="filePath"/> is null or whitespace.</exception>
	/// <exception cref="FileNotFoundException">When the file does not exist.</exception>
	public static async Task<IReadOnlyDictionary<string, string>> LoadAsync(
		string filePath,
		CancellationToken cancellationToken = default)
	{
		var secrets = await ResolveFileAsync(filePath, cancellationToken).ConfigureAwait(false);
		EnvilderClient.InjectIntoEnvironment(secrets);
		return secrets;
	}

	/// <summary>
	/// Resolves secrets using environment-based routing. Looks up <paramref name="environment"/>
	/// in <paramref name="envMapping"/>; if the value is a file path, resolves from that file.
	/// Returns an empty dictionary when the environment maps to <see langword="null"/> or is absent.
	/// </summary>
	/// <param name="environment">The current environment name (e.g. "production").</param>
	/// <param name="envMapping">Maps environment names to map-file paths (or <see langword="null"/> to skip).</param>
	/// <returns>Resolved secrets, or an empty dictionary.</returns>
	/// <exception cref="ArgumentException">When <paramref name="environment"/> is null or whitespace.</exception>
	public static IReadOnlyDictionary<string, string> ResolveFile(
		string environment,
		IDictionary<string, string?> envMapping)
	{
		var filePath = ResolveEnvSource(environment, envMapping);
		if (filePath is null)
		{
			return new Dictionary<string, string>();
		}

		return ResolveFile(filePath);
	}

	/// <summary>
	/// Asynchronously resolves secrets using environment-based routing.
	/// </summary>
	/// <param name="environment">The current environment name.</param>
	/// <param name="envMapping">Maps environment names to map-file paths (or <see langword="null"/> to skip).</param>
	/// <param name="cancellationToken">Optional cancellation token.</param>
	/// <returns>Resolved secrets, or an empty dictionary.</returns>
	public static async Task<IReadOnlyDictionary<string, string>> ResolveFileAsync(
		string environment,
		IDictionary<string, string?> envMapping,
		CancellationToken cancellationToken = default)
	{
		var filePath = ResolveEnvSource(environment, envMapping);
		if (filePath is null)
		{
			return new Dictionary<string, string>();
		}

		return await ResolveFileAsync(filePath, cancellationToken).ConfigureAwait(false);
	}

	/// <summary>
	/// Resolves secrets using environment-based routing and injects them as
	/// process-level environment variables.
	/// </summary>
	/// <param name="environment">The current environment name.</param>
	/// <param name="envMapping">Maps environment names to map-file paths (or <see langword="null"/> to skip).</param>
	/// <returns>Resolved secrets, or an empty dictionary.</returns>
	/// <exception cref="ArgumentException">When <paramref name="environment"/> is null or whitespace.</exception>
	public static IReadOnlyDictionary<string, string> Load(
		string environment,
		IDictionary<string, string?> envMapping)
	{
		var filePath = ResolveEnvSource(environment, envMapping);
		if (filePath is null)
		{
			return new Dictionary<string, string>();
		}

		return Load(filePath);
	}

	/// <summary>
	/// Asynchronously resolves secrets using environment-based routing and injects them
	/// as process-level environment variables.
	/// </summary>
	/// <param name="environment">The current environment name.</param>
	/// <param name="envMapping">Maps environment names to map-file paths (or <see langword="null"/> to skip).</param>
	/// <param name="cancellationToken">Optional cancellation token.</param>
	/// <returns>Resolved secrets, or an empty dictionary.</returns>
	public static async Task<IReadOnlyDictionary<string, string>> LoadAsync(
		string environment,
		IDictionary<string, string?> envMapping,
		CancellationToken cancellationToken = default)
	{
		var filePath = ResolveEnvSource(environment, envMapping);
		if (filePath is null)
		{
			return new Dictionary<string, string>();
		}

		return await LoadAsync(filePath, cancellationToken).ConfigureAwait(false);
	}

	private static string? ResolveEnvSource(
		string environment,
		IDictionary<string, string?> envMapping)
	{
		if (string.IsNullOrWhiteSpace(environment))
		{
			throw new ArgumentException("Environment name cannot be null or empty.", nameof(environment));
		}

		if (envMapping is null)
		{
			throw new ArgumentNullException(nameof(envMapping));
		}

		environment = environment.Trim();

		if (!envMapping.TryGetValue(environment, out var filePath))
		{
			return null;
		}

		if (filePath is null)
		{
			return null;
		}

		if (string.IsNullOrWhiteSpace(filePath))
		{
			throw new ArgumentException(
				$"Map file path for environment '{environment}' cannot be empty or whitespace.",
				nameof(envMapping));
		}

		return filePath;
	}

	/// <summary>
	/// Returns a fluent <see cref="EnvilderBuilder"/> for the given map file.
	/// Chain <see cref="EnvilderBuilder.WithProvider"/>, <see cref="EnvilderBuilder.WithProfile"/>,
	/// or <see cref="EnvilderBuilder.WithVaultUrl"/> before calling <see cref="EnvilderBuilder.Resolve"/>
	/// or <see cref="EnvilderBuilder.Inject"/>.
	/// </summary>
	/// <param name="filePath">Path to the JSON map file on disk.</param>
	/// <returns>A builder for configuring overrides and resolving secrets.</returns>
	/// <exception cref="ArgumentException">When <paramref name="filePath"/> is null or whitespace.</exception>
	public static EnvilderBuilder FromMapFile(string filePath)
	{
		if (string.IsNullOrWhiteSpace(filePath))
		{
			throw new ArgumentException("File path cannot be null or empty.", nameof(filePath));
		}

		return new EnvilderBuilder(filePath);
	}

	internal static void ValidateFileExists(string filePath)
	{
		if (!File.Exists(filePath))
		{
			throw new FileNotFoundException($"Map file not found: {filePath}", filePath);
		}
	}

	// StreamReader.ReadToEndAsync(CancellationToken) is not available on netstandard2.0.
	// We check cancellation before and after the read to honour the token as closely as possible.
	internal static async Task<string> ReadFileAsync(
		string filePath,
		CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();
		using var reader = new StreamReader(filePath);
		var content = await reader.ReadToEndAsync().ConfigureAwait(false);
		cancellationToken.ThrowIfCancellationRequested();
		return content;
	}

	private static void ValidateFilePath(string filePath)
	{
		if (string.IsNullOrWhiteSpace(filePath))
		{
			throw new ArgumentException("File path cannot be null or empty.", nameof(filePath));
		}

		ValidateFileExists(filePath);
	}
}