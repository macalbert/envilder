namespace Envilder.Domain;

using System.Collections.Generic;

/// <summary>
/// Result of parsing a map file. Contains provider configuration and
/// the environment-variable-name → secret-path mappings.
/// </summary>
public class ParsedMapFile
{
    public ParsedMapFile(MapFileConfig config, Dictionary<string, string> mappings)
    {
        Config = config;
        Mappings = mappings;
    }

    /// <summary>
    /// Provider configuration read from the <c>$config</c> section.
    /// </summary>
    public MapFileConfig Config { get; }

    /// <summary>
    /// Dictionary mapping environment variable names to secret paths/names
    /// (e.g. <c>"DB_URL" → "/app/db-url"</c>).
    /// </summary>
    public Dictionary<string, string> Mappings { get; }
}