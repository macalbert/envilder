namespace Envilder.Application;

using global::Envilder.Domain;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

/// <summary>
/// Parses a JSON map file into a <see cref="ParsedMapFile"/> containing
/// provider configuration (<c>$config</c>) and environment variable mappings.
/// </summary>
public class MapFileParser
{
	private const string ConfigKey = "$config";

	private static readonly JsonSerializerOptions SerializerOptions = new()
	{
		PropertyNameCaseInsensitive = true,
		Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
	};

	/// <summary>
	/// Parses raw JSON into a <see cref="ParsedMapFile"/>.
	/// The optional <c>$config</c> object is extracted as <see cref="MapFileConfig"/>;
	/// all other top-level string properties become secret mappings.
	/// </summary>
	/// <param name="json">Raw JSON content of the map file.</param>
	/// <returns>A <see cref="ParsedMapFile"/> ready for secret resolution.</returns>
	public ParsedMapFile Parse(string json)
	{
		using var document = JsonDocument.Parse(json);
		var mappings = new Dictionary<string, string>();
		var config = new MapFileConfig();

		foreach (var property in document.RootElement.EnumerateObject())
		{
			if (property.Name == ConfigKey)
			{
				if (property.Value.ValueKind == JsonValueKind.Object)
				{
					config = JsonSerializer.Deserialize<MapFileConfig>(property.Value.GetRawText(), SerializerOptions)
						?? new();
				}

				continue;
			}

			if (property.Value.ValueKind != JsonValueKind.String)
			{
				continue;
			}

			mappings[property.Name] = property.Value.GetString()!;
		}

		return new(config, mappings);
	}
}