namespace Envilder;

using System.Collections.Generic;
using System.Linq;

/// <summary>
/// The outcome of checking a map file contract: the map file is valid and
/// every declared secret exists. When the map file is invalid,
/// <see cref="Keys"/> is empty because no provider was called.
/// </summary>
public class ContractValidationResult
{
	/// <summary>Initializes a new instance.</summary>
	/// <param name="mapFileErrors">Every reason the map file cannot be used.</param>
	/// <param name="keys">One check per variable of the map file, in map-file order.</param>
	public ContractValidationResult(
		IReadOnlyList<MapFileError> mapFileErrors,
		IReadOnlyList<KeyCheck> keys)
	{
		MapFileErrors = mapFileErrors;
		Keys = keys;
		IsValid = mapFileErrors.Count == 0
			&& keys.All(key => key.Status == SecretExistenceStatus.Exists);
	}

	/// <summary>
	/// <see langword="true"/> when the map file has no errors and every key
	/// <see cref="SecretExistenceStatus.Exists"/>.
	/// </summary>
	public bool IsValid { get; }

	/// <summary>Why the map file cannot be used. Empty when it is valid.</summary>
	public IReadOnlyList<MapFileError> MapFileErrors { get; }

	/// <summary>One check per variable, in map-file order. Empty when the map file is invalid.</summary>
	public IReadOnlyList<KeyCheck> Keys { get; }
}