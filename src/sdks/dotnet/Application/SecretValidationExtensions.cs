namespace Envilder.Application;

using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// Thrown by <see cref="SecretValidationExtensions.ValidateSecrets"/> when one or
/// more resolved secrets are missing (empty, whitespace-only, or the dictionary is empty).
/// </summary>
/// <example>
/// <code>
/// var secrets = Envilder.ResolveFile("param-map.json");
/// try
/// {
///     secrets.ValidateSecrets();
/// }
/// catch (SecretValidationException ex)
/// {
///     Console.WriteLine($"Missing: {string.Join(", ", ex.MissingKeys)}");
/// }
/// </code>
/// </example>
public class SecretValidationException : Exception
{
	/// <summary>
	/// Keys whose values were null, empty, or whitespace.
	/// Empty when the entire dictionary was empty.
	/// </summary>
	public IReadOnlyList<string> MissingKeys { get; }

	/// <summary>
	/// Initializes a new instance with the keys that failed validation.
	/// </summary>
	/// <param name="missingKeys">
	/// Keys whose values were null, empty, or whitespace.
	/// Pass an empty list when the entire dictionary was empty.
	/// </param>
	public SecretValidationException(IReadOnlyList<string> missingKeys)
		: base(BuildMessage(missingKeys))
	{
		MissingKeys = missingKeys;
	}

	private static string BuildMessage(IReadOnlyList<string> missingKeys)
	{
		if (missingKeys.Count == 0)
		{
			return "No secrets were resolved.";
		}

		return $"The following secrets have empty or missing values: {string.Join(", ", missingKeys)}";
	}
}

/// <summary>
/// Extension methods for validating resolved secret dictionaries.
/// </summary>
public static class SecretValidationExtensions
{
	/// <summary>
	/// Validates that the dictionary is not empty and every value is non-null
	/// and non-whitespace. Throws <see cref="SecretValidationException"/> on failure.
	/// </summary>
	/// <param name="secrets">The resolved secrets to validate.</param>
	/// <exception cref="ArgumentNullException">When <paramref name="secrets"/> is null.</exception>
	/// <exception cref="SecretValidationException">
	/// When the dictionary is empty or any value is null, empty, or whitespace.
	/// </exception>
	/// <example>
	/// <code>
	/// var secrets = Envilder.ResolveFile("param-map.json");
	/// secrets.ValidateSecrets(); // throws if any value is empty
	/// </code>
	/// </example>
	public static void ValidateSecrets(this IReadOnlyDictionary<string, string> secrets)
	{
		if (secrets is null)
		{
			throw new ArgumentNullException(nameof(secrets));
		}

		if (secrets.Count == 0)
		{
			throw new SecretValidationException(Array.Empty<string>());
		}

		var missingKeys = secrets
			.Where(kvp => string.IsNullOrWhiteSpace(kvp.Value))
			.Select(kvp => kvp.Key)
			.ToList();

		if (missingKeys.Count > 0)
		{
			throw new SecretValidationException(missingKeys);
		}
	}
}