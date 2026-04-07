using System.Collections.Generic;
using System.Text.Json;
using Envilder.Domain;

namespace Envilder.Application;

public class MapFileParser
{
    private const string ConfigKey = "$config";

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public ParsedMapFile Parse(string json)
    {
        var document = JsonDocument.Parse(json);
        var mappings = new Dictionary<string, string>();
        var config = new MapFileConfig();

        foreach (var property in document.RootElement.EnumerateObject())
        {
            if (property.Name == ConfigKey)
            {
                if (property.Value.ValueKind == JsonValueKind.Object)
                {
                    config = JsonSerializer.Deserialize<MapFileConfig>(property.Value.GetRawText(), SerializerOptions)
                        ?? new MapFileConfig();
                }
                continue;
            }

            mappings[property.Name] = property.Value.GetString()!;
        }

        return new ParsedMapFile
        {
            Config = config,
            Mappings = mappings,
        };
    }
}
