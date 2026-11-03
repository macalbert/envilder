namespace Envilder;

/// <summary>
/// One variable of the map file with the outcome for the path it maps to.
/// </summary>
public class KeyCheck
{
	/// <summary>Initializes a new instance.</summary>
	/// <param name="variable">The environment variable name.</param>
	/// <param name="path">The secret path or name it maps to.</param>
	/// <param name="provider">The provider the path was checked against.</param>
	/// <param name="status">Whether the secret exists.</param>
	/// <param name="reason">Why the status is not <c>Exists</c> or <c>Missing</c>, when known.</param>
	public KeyCheck(
		string variable,
		string path,
		SecretProviderType provider,
		SecretExistenceStatus status,
		string? reason = null)
	{
		Variable = variable;
		Path = path;
		Provider = provider;
		Status = status;
		Reason = reason;
	}

	/// <summary>The environment variable name.</summary>
	public string Variable { get; }

	/// <summary>The secret path or name the variable maps to.</summary>
	public string Path { get; }

	/// <summary>The provider the path was checked against.</summary>
	public SecretProviderType Provider { get; }

	/// <summary>Whether the secret exists.</summary>
	public SecretExistenceStatus Status { get; }

	/// <summary>The provider's explanation for the status, when it gave one.</summary>
	public string? Reason { get; }
}