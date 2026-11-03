namespace Envilder;

using System;

internal static class SecretExistenceStatusExtensions
{
	/// <summary>
	/// The status as it is written in messages and shared with the CLI and the
	/// other SDKs (<c>access_denied</c>, not <c>AccessDenied</c>).
	/// </summary>
	public static string ToWireValue(this SecretExistenceStatus status)
	{
		return status switch
		{
			SecretExistenceStatus.Exists => "exists",
			SecretExistenceStatus.Missing => "missing",
			SecretExistenceStatus.AccessDenied => "access_denied",
			SecretExistenceStatus.AuthenticationFailed => "authentication_failed",
			SecretExistenceStatus.ProviderError => "provider_error",
			_ => throw new ArgumentOutOfRangeException(nameof(status), status, null),
		};
	}
}