namespace Envilder;

/// <summary>
/// The outcome of checking one secret path. <see cref="Reason"/> explains a
/// status other than <see cref="SecretExistenceStatus.Exists"/> or
/// <see cref="SecretExistenceStatus.Missing"/> when the provider gave one; it
/// never carries a secret value.
/// </summary>
public class SecretExistence
{
	/// <summary>Initializes a new instance.</summary>
	/// <param name="status">Whether the secret exists.</param>
	/// <param name="reason">Why the status is not <c>Exists</c> or <c>Missing</c>, when known.</param>
	public SecretExistence(SecretExistenceStatus status, string? reason = null)
	{
		Status = status;
		Reason = reason;
	}

	/// <summary>Whether the secret exists.</summary>
	public SecretExistenceStatus Status { get; }

	/// <summary>The provider's explanation for the status, when it gave one.</summary>
	public string? Reason { get; }
}