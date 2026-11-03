namespace Envilder;

/// <summary>
/// Whether a secret declared in the map file can be resolved, checked without
/// reading its value.
/// </summary>
public enum SecretExistenceStatus
{
	/// <summary>The secret is there and the identity can see it.</summary>
	Exists,

	/// <summary>The provider answered that there is no such secret.</summary>
	Missing,

	/// <summary>
	/// The identity is not allowed to check the secret, so whether it exists is
	/// unknown. Never reported as <see cref="Missing"/>.
	/// </summary>
	AccessDenied,

	/// <summary>The provider rejected the credentials, or none could be found.</summary>
	AuthenticationFailed,

	/// <summary>Anything else, for example an unreachable provider.</summary>
	ProviderError,
}