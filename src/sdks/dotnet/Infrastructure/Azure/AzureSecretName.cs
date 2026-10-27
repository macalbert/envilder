namespace Envilder.Infrastructure.Azure;

using System;
using System.Text.RegularExpressions;

/// <summary>
/// Maps a map-file reference to its Azure Key Vault secret name, with the same
/// rule as the envilder CLI so every surface reads the same secret.
/// A name Azure already accepts (1-127 letters, digits and hyphens) is used as
/// written: <c>Database--Password</c>, <c>1password-token</c>. Only a name
/// Azure would reject is rewritten, the way the CLI has always stored such
/// secrets: <c>/myapp/db_password</c> becomes <c>myapp-db-password</c>.
/// </summary>
/// <seealso href="https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning"/>
internal static class AzureSecretName
{
	private const int MaxLength = 127;

	// `\z` rather than `$`: .NET's `$` also matches before a trailing newline.
	private static readonly Regex ValidName = new(@"^[0-9A-Za-z-]{1,127}\z");
	private static readonly Regex UnsupportedCharacter = new(@"[^a-zA-Z0-9\-_/]");

	public static string From(string name)
	{
		if (UnsupportedCharacter.IsMatch(name))
		{
			throw new ArgumentException(
				$"Invalid secret name '{name}': contains characters not allowed by Azure Key Vault. "
				+ "Only alphanumeric characters, hyphens, slashes, and underscores are accepted.",
				nameof(name));
		}

		if (ValidName.IsMatch(name))
		{
			return name;
		}

		var normalized = Normalize(name);
		if (normalized.Length > MaxLength)
		{
			throw new ArgumentException(
				$"Invalid secret name '{name}': normalized name '{normalized}' exceeds the "
				+ $"{MaxLength}-character limit for Azure Key Vault.",
				nameof(name));
		}

		return normalized;
	}

	private static string Normalize(string name)
	{
		var normalized = name.TrimStart('/');
		normalized = Regex.Replace(normalized, "[/_]", "-").ToLowerInvariant();
		normalized = Regex.Replace(normalized, "-+", "-").Trim('-');

		if (normalized.Length > 0 && !(normalized[0] >= 'a' && normalized[0] <= 'z'))
		{
			normalized = "secret-" + normalized;
		}

		return normalized.Length == 0 ? "secret" : normalized;
	}
}