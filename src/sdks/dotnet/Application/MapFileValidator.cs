namespace Envilder;

using Envilder.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

/// <summary>
/// Checks a map file against <c>spec/map-file.v1.json</c> and the provider
/// configuration it resolves to, with the same rules and wording as
/// <c>envilder validate --offline</c>. The SDK supports fewer providers than
/// the schema declares, so <c>gcp</c>, <c>hashicorp</c> and <c>file</c> are
/// reported as unsupported. Builder overrides take precedence over
/// <c>$config</c>, as they do on a load. No mapped value ever reaches an error.
/// </summary>
internal static class MapFileValidator
{
	private const string DefaultProvider = "aws";

	private static readonly string[] SupportedProviders = ["aws", "azure"];

	private static readonly string[] ConfigFields =
	[
		"provider",
		"profile",
		"vaultUrl",
		"projectId",
		"namespace",
		"path",
		"name",
		"description",
		"owner",
		"environment",
	];

	private static readonly string[] UriFields = ["vaultUrl"];

	private static readonly (string Field, string[] Providers)[] ProviderSpecificFields =
	[
		("profile", ["aws"]),
		("vaultUrl", ["azure", "hashicorp"]),
		("projectId", ["gcp"]),
		("namespace", ["hashicorp"]),
		("path", ["file"]),
	];

	private static readonly Dictionary<string, string> RequiredProviderFields = new()
	{
		["azure"] = "vaultUrl",
	};

	private static readonly Dictionary<string, string> ProviderLabels = new()
	{
		["aws"] = "AWS",
		["azure"] = "Azure",
	};

	private static readonly Dictionary<string, string> OverrideMethods = new()
	{
		["provider"] = "WithProvider()",
		["profile"] = "WithProfile()",
		["vaultUrl"] = "WithVaultUrl()",
	};

	/// <summary>Parses and validates the raw content of a map file.</summary>
	public static IReadOnlyList<MapFileError> ValidateContent(string json, EnvilderOptions overrides)
	{
		try
		{
			using var document = JsonDocument.Parse(json);
			return Validate(document.RootElement, overrides);
		}
		catch (JsonException)
		{
			// The parser's message quotes the surrounding text, which can be a
			// secret pasted into the file, so it is not repeated.
			return [new("(root)", "The map file is not valid JSON.")];
		}
	}

	private static List<MapFileError> Validate(JsonElement root, EnvilderOptions overrides)
	{
		if (root.ValueKind != JsonValueKind.Object)
		{
			return [new("(root)", "The map file must be a JSON object.")];
		}

		var errors = new List<MapFileError>();
		var fileConfig = new Dictionary<string, JsonElement>();
		foreach (var property in root.EnumerateObject())
		{
			var key = property.Name;
			if (key == "$schema")
			{
				errors.AddRange(ValidateUri("$schema", property.Value));
			}
			else if (key == "$config")
			{
				if (property.Value.ValueKind == JsonValueKind.Object)
				{
					fileConfig = property.Value.EnumerateObject()
						.GroupBy(field => field.Name)
						.ToDictionary(group => group.Key, group => group.Last().Value);
					errors.AddRange(ValidateConfigFields(property.Value));
				}
				else
				{
					errors.Add(new("$config", "$config must be an object."));
				}
			}
			else if (key.StartsWith("$", StringComparison.Ordinal))
			{
				errors.Add(new(
					key,
					$"{FormatKey(key)} is reserved: only $schema and $config may start with \"$\"."));
			}
			else
			{
				errors.AddRange(ValidateMapping(key, property.Value));
			}
		}

		errors.AddRange(ValidateProviderConfiguration(fileConfig, overrides));
		return errors;
	}

	private static List<MapFileError> ValidateMapping(string key, JsonElement value)
	{
		var errors = new List<MapFileError>();
		if (!EnvironmentVariableName.IsValid(key))
		{
			errors.Add(new(key, $"{EnvironmentVariableName.InvalidMessage(key)}."));
		}

		if (value.ValueKind != JsonValueKind.String)
		{
			// The type only: the value itself may be a secret pasted by mistake.
			errors.Add(new(
				key,
				$"{FormatKey(key)} must map to a string secret path, not {DescribeType(value)}."));
		}

		return errors;
	}

	private static List<MapFileError> ValidateConfigFields(JsonElement config)
	{
		var errors = new List<MapFileError>();
		foreach (var property in config.EnumerateObject())
		{
			var field = property.Name;
			var key = $"$config.{field}";
			if (!ConfigFields.Contains(field))
			{
				errors.Add(new(
					key,
					$"{FormatKey(key)} is not a known field. Allowed fields: {string.Join(", ", ConfigFields)}."));
			}
			else if (property.Value.ValueKind != JsonValueKind.String)
			{
				errors.Add(new(key, $"{key} must be a string, not {DescribeType(property.Value)}."));
			}
			else if (UriFields.Contains(field))
			{
				errors.AddRange(ValidateUri(key, property.Value));
			}
		}

		return errors;
	}

	private static List<MapFileError> ValidateUri(string key, JsonElement value)
	{
		if (value.ValueKind != JsonValueKind.String)
		{
			return [new(key, $"{key} must be a string, not {DescribeType(value)}.")];
		}

		return IsUri(value.GetString()!)
			? []
			: [new(key, $"{key} must be an absolute URI.")];
	}

	private static List<MapFileError> ValidateProviderConfiguration(
		Dictionary<string, JsonElement> fileConfig,
		EnvilderOptions overrides)
	{
		var effective = ResolveEffectiveConfig(fileConfig, overrides);
		var provider = effective.TryGetValue("provider", out var configured)
			? configured
			: new(DefaultProvider, "$config.provider");

		if (!SupportedProviders.Contains(provider.Value))
		{
			return
			[
				new(
					provider.Source,
					$"Unsupported provider: {FormatKey(provider.Value)}."
					+ $" Supported providers: {string.Join(", ", SupportedProviders)}."),
			];
		}

		var errors = new List<MapFileError>();
		foreach (var (field, validProviders) in ProviderSpecificFields)
		{
			if (!effective.TryGetValue(field, out var setting) || validProviders.Contains(provider.Value))
			{
				continue;
			}

			var usable = validProviders.Where(name => SupportedProviders.Contains(name)).ToList();
			var names = string.Join(" or ", usable.Count > 0 ? usable : validProviders.ToList());
			errors.Add(new(
				setting.Source,
				$"{setting.Source} is only supported with the {names} provider"
				+ $" (current provider: {provider.Value})."));
		}

		if (RequiredProviderFields.TryGetValue(provider.Value, out var required)
			&& !effective.ContainsKey(required))
		{
			errors.Add(new(
				$"$config.{required}",
				$"{required} is required when using {ProviderLabels[provider.Value]} provider."
				+ $" Set it in $config.{required} in your map file"
				+ $" or via {OverrideMethods[required]}."));
		}

		return errors;
	}

	private static Dictionary<string, SourcedValue> ResolveEffectiveConfig(
		Dictionary<string, JsonElement> fileConfig,
		EnvilderOptions overrides)
	{
		var effective = new Dictionary<string, SourcedValue>();
		foreach (var field in ConfigFields)
		{
			if (fileConfig.TryGetValue(field, out var value) && value.ValueKind == JsonValueKind.String)
			{
				effective[field] = new(value.GetString()!, $"$config.{field}");
			}
		}

		// Blank overrides are ignored, as they are on a load.
		var overridden = new Dictionary<string, string?>
		{
			["provider"] = overrides.Provider?.ToString(),
			["profile"] = overrides.Profile,
			["vaultUrl"] = overrides.VaultUrl,
		};
		foreach (var entry in OverrideMethods)
		{
			var field = entry.Key;
			var value = overridden[field]?.Trim();
			if (!string.IsNullOrEmpty(value))
			{
				effective[field] = new(
					field == "provider" ? value!.ToLowerInvariant() : value!,
					entry.Value);
			}
		}

		return effective;
	}

	private static bool IsUri(string value)
	{
		var colon = value.IndexOf(':');
		return colon > 0
			&& IsScheme(value.Substring(0, colon))
			&& !value.Any(char.IsWhiteSpace)
			&& Uri.TryCreate(value, UriKind.Absolute, out _);
	}

	private static bool IsScheme(string scheme)
	{
		return IsAsciiLetter(scheme[0])
			&& scheme.All(c => IsAsciiLetter(c) || (c is >= '0' and <= '9') || c is '+' or '.' or '-');
	}

	private static bool IsAsciiLetter(char c)
	{
		return c is (>= 'A' and <= 'Z') or (>= 'a' and <= 'z');
	}

	private static string DescribeType(JsonElement value)
	{
		return value.ValueKind switch
		{
			JsonValueKind.Null => "null",
			JsonValueKind.Array => "an array",
			JsonValueKind.Object => "an object",
			JsonValueKind.String => "a string",
			JsonValueKind.Number => "a number",
			_ => "a boolean",
		};
	}

	/// <summary>
	/// Keys are untrusted input: anything outside a plain identifier is quoted,
	/// so a key carrying a line break cannot split a message.
	/// </summary>
	private static string FormatKey(string key)
	{
		var plain = key.Length > 0 && key.All(c =>
			IsAsciiLetter(c) || (c is >= '0' and <= '9') || c is '_' or '$' or '.' or '/' or '-');
		return plain ? key : EnvironmentVariableName.Quote(key);
	}

	/// <summary>A configuration field with the key that named it, for the report.</summary>
	private sealed class SourcedValue
	{
		public SourcedValue(string value, string source)
		{
			Value = value;
			Source = source;
		}

		public string Value { get; }

		public string Source { get; }
	}
}