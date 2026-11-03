namespace Envilder;

using System;
using System.Linq;

/// <summary>
/// Thrown by a load with contract validation enabled when the map file is
/// invalid or a declared secret cannot be confirmed. The message names the
/// failing keys and paths, never a secret value.
/// </summary>
public class ContractValidationException : Exception
{
	/// <summary>Initializes a new instance for the check that failed.</summary>
	/// <param name="result">The full outcome of the check.</param>
	public ContractValidationException(ContractValidationResult result)
		: base(BuildMessage(result))
	{
		Result = result;
	}

	/// <summary>The full outcome of the check that failed.</summary>
	public ContractValidationResult Result { get; }

	private static string BuildMessage(ContractValidationResult result)
	{
		if (result.MapFileErrors.Count > 0)
		{
			var errors = string.Join(
				"; ",
				result.MapFileErrors.Select(error => $"{error.Key}: {error.Message}"));
			return $"Map file contract validation failed: {errors}";
		}

		var keys = string.Join(
			", ",
			result.Keys
				.Where(key => key.Status != SecretExistenceStatus.Exists)
				.Select(key => $"{key.Variable} ({key.Path}): {key.Status.ToWireValue()}"));
		return $"Map file contract validation failed: {keys}";
	}
}