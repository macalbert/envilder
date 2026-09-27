namespace Envilder.Domain;

using System.Text.Json;

/// <summary>
/// Which strings are usable as environment variable names, per the map-file
/// naming constraint in ADR-0008: an accepted name must survive a <c>.env</c>
/// round-trip as itself and nothing else. <c>^[A-Za-z0-9_.-]+$</c> is exactly
/// the key grammar <c>.env</c> parsers recognize, so anything outside it is
/// either read back as a different assignment (<c>=</c>, CR, LF, U+2028,
/// U+2029) or silently lost (a space, <c>#</c>, a tab, a non-Latin letter).
/// <c>__proto__</c> is inside the allowlist but every JavaScript reader drops
/// it, so it is rejected as well to keep the contract uniform across the CLI
/// and every SDK.
/// </summary>
internal static class EnvironmentVariableName
{
	private const string UnsupportedName = "__proto__";

	public static bool IsValid(string name)
	{
		if (string.IsNullOrEmpty(name) || name == UnsupportedName)
		{
			return false;
		}

		// A character check rather than a Regex: .NET's `$` also matches
		// before a trailing newline, which would accept "SAFE\n".
		foreach (var c in name)
		{
			if (!IsReadableNameChar(c))
			{
				return false;
			}
		}

		return true;
	}

	/// <summary>
	/// Builds the rejection message. The name is untrusted input, so it is
	/// quoted rather than interpolated: a name carrying line terminators cannot
	/// break the message across lines. Only the name is echoed, never the
	/// mapped value.
	/// </summary>
	public static string InvalidMessage(string name)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			return "Environment variable name cannot be empty";
		}

		if (name == UnsupportedName)
		{
			return $"Unsupported environment variable name {Quote(name)}: "
				+ "a .env parser cannot read this name back, so it would be written "
				+ "but never resolved";
		}

		return $"Invalid environment variable name {Quote(name)}: names may only "
			+ "contain letters, digits, underscore, dot and hyphen, so that they can "
			+ "be read back from a .env file";
	}

	private static bool IsReadableNameChar(char c)
	{
		return c is (>= 'A' and <= 'Z') or (>= 'a' and <= 'z') or (>= '0' and <= '9')
			or '_' or '.' or '-';
	}

	// The default encoder escapes control characters and every non-ASCII
	// character, U+2028/U+2029 included.
	private static string Quote(string name)
	{
		return JsonSerializer.Serialize(name);
	}
}