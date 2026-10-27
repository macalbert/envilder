namespace Envilder.Infrastructure.Azure;

/// <summary>
/// The only translation between a map-file reference and a Key Vault secret
/// name, shared with the envilder CLI: <c>/</c> becomes <c>-</c>, ignoring
/// leading slashes, so a path-style reference such as <c>/myapp/db/password</c>
/// reads <c>myapp-db-password</c>. Anything else reaches Key Vault as written,
/// and a name it does not accept fails with Key Vault's own error.
/// </summary>
/// <seealso href="https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning"/>
internal static class AzureSecretName
{
	public static string From(string name)
	{
		return name.TrimStart('/').Replace('/', '-');
	}
}