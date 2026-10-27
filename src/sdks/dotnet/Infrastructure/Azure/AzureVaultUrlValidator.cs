namespace Envilder.Infrastructure.Azure;

using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// Checks an Azure Key Vault URL before any credential is sent to it, the same
/// rule the envilder CLI applies: the URL must be <c>https://</c> and its host
/// must end with one of the allowed host suffixes.
/// </summary>
internal static class AzureVaultUrlValidator
{
	public static readonly IReadOnlyList<string> DefaultVaultHosts =
	[
		".vault.azure.net",
		".vault.azure.cn",
		".vault.usgovcloudapi.net",
		".vault.microsoftazure.de",
	];

	public static Uri Validate(string vaultUrl, IReadOnlyCollection<string> allowedHosts)
	{
		if (!Uri.TryCreate(vaultUrl, UriKind.Absolute, out var uri))
		{
			throw new InvalidOperationException("vaultUrl must be a valid URL.");
		}

		if (uri.Scheme != Uri.UriSchemeHttps)
		{
			throw new InvalidOperationException("vaultUrl must use https:// protocol.");
		}

		if (uri.GetComponents(UriComponents.StrongAuthority, UriFormat.UriEscaped).IndexOf('@') >= 0)
		{
			throw new InvalidOperationException("vaultUrl must not contain user information.");
		}

		if (!IsAllowedHost(uri.Host, allowedHosts))
		{
			throw new InvalidOperationException(
				$"vaultUrl hostname must end with one of: {string.Join(", ", allowedHosts)}.");
		}

		return uri;
	}

	public static bool IsAllowedHost(string host, IEnumerable<string> allowedHosts)
	{
		return allowedHosts
			.Select(suffix => suffix.Trim().TrimStart('.'))
			.Where(suffix => suffix.Length > 0)
			.Any(suffix => host.Equals(suffix, StringComparison.OrdinalIgnoreCase)
				|| host.EndsWith("." + suffix, StringComparison.OrdinalIgnoreCase));
	}
}