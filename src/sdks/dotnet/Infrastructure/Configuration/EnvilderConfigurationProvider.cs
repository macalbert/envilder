namespace Envilder.Infrastructure.Configuration;

using Microsoft.Extensions.Configuration;
using System;

public class EnvilderConfigurationProvider : ConfigurationProvider
{
	private readonly EnvilderClient _client;
	private readonly ParsedMapFile _mapFile;

	public EnvilderConfigurationProvider(EnvilderClient client, ParsedMapFile mapFile)
	{
		_client = client ?? throw new ArgumentNullException(nameof(client));
		_mapFile = mapFile ?? throw new ArgumentNullException(nameof(mapFile));
	}

	public override void Load()
	{
		var secrets = _client.ResolveSecrets(_mapFile);

		Data.Clear();

		foreach (var kvp in secrets)
		{
			var key = NormalizeKey(kvp.Key);
			Data[key] = kvp.Value;
		}
	}

	// `__` is the section separator a map file can express: `/` and `:` fall
	// outside the ADR-0008 name grammar, so the CLI would write a `.env` line
	// no reader loads. `__` survives that round-trip and is the same convention
	// .NET's own environment-variables provider uses. `/` is still normalized
	// for callers that build a ParsedMapFile in code.
	private static string NormalizeKey(string key)
	{
		return key
			.Replace("__", ConfigurationPath.KeyDelimiter)
			.Replace("/", ConfigurationPath.KeyDelimiter);
	}
}