namespace Envilder.Tests.Fixtures;

using Amazon.Runtime;
using Envilder.Infrastructure;

/// <summary>
/// Resolves the container environment shared by the LocalStack (AWS) and
/// LocalStack for Azure fixtures (e.g. <c>LOCALSTACK_AUTH_TOKEN</c>) from the
/// repository's root <c>envilder.json</c>, using the SDK itself.
/// </summary>
internal static class LocalStackEnvironment
{
	public const string AuthTokenVariable = "LOCALSTACK_AUTH_TOKEN";

	public static async Task<IReadOnlyDictionary<string, string>> LoadAsync()
	{
		const string filename = "envilder.json";

		var assembly = typeof(LocalStackEnvironment).Assembly;
		var resourceName = $"{assembly.GetName().Name}.{filename}";

		using var stream =
			assembly.GetManifestResourceStream(resourceName)
			?? throw new InvalidOperationException(
				$"Embedded resource '{resourceName}' not found in assembly '{assembly.FullName}'.");
		using var reader = new StreamReader(stream);
		var json = await reader.ReadToEndAsync();

		var parser = new MapFileParser();
		var mapFile = parser.Parse(json);
		var client = ResolveClient(mapFile);
		var secrets = await client.ResolveSecretsAsync(mapFile);

		return secrets.AsReadOnly();
	}

	// Workaround: CI/CD pipelines may not have credentials configured for the
	// provider declared in the map file's $config section (e.g. Azure Key Vault).
	// When the configured provider cannot be created, fall back to AWS so the
	// integration tests can still run against LocalStack.
	private static EnvilderClient ResolveClient(ParsedMapFile mapFile)
	{
		try
		{
			return new(SecretProviderFactory.Create(mapFile.Config));
		}
		catch (Exception ex) when (ex is InvalidOperationException or AmazonServiceException)
		{
			return new(SecretProviderFactory.Create(new() { Provider = SecretProviderType.Aws }));
		}
	}
}