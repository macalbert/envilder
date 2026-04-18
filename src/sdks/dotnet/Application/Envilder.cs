namespace Envilder.Application;

using global::Envilder.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

public static class Envilder
{
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

    public static async Task<IReadOnlyDictionary<string, string>> ResolveFileAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        ValidateFilePath(filePath);
        string json;
        using (var reader = new StreamReader(filePath))
        {
            json = await reader.ReadToEndAsync().ConfigureAwait(false);
        }
        var parser = new MapFileParser();
        var mapFile = parser.Parse(json);
        var provider = SecretProviderFactory.Create(mapFile.Config);
        var client = new EnvilderClient(provider);
        var secrets = await client.ResolveSecretsAsync(mapFile, cancellationToken).ConfigureAwait(false);
        return new Dictionary<string, string>(secrets);
    }

    public static IReadOnlyDictionary<string, string> Load(string filePath)
    {
        var secrets = ResolveFile(filePath);
        EnvilderClient.InjectIntoEnvironment((Dictionary<string, string>)secrets);
        return secrets;
    }

    public static async Task<IReadOnlyDictionary<string, string>> LoadAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        var secrets = await ResolveFileAsync(filePath, cancellationToken).ConfigureAwait(false);
        EnvilderClient.InjectIntoEnvironment((Dictionary<string, string>)secrets);
        return secrets;
    }

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

    public static EnvilderBuilder FromFile(string filePath)
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

    internal static async Task<string> ReadFileAsync(
        string filePath,
        CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(filePath);
        return await reader.ReadToEndAsync().ConfigureAwait(false);
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
