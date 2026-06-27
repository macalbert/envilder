namespace Envilder;

using System;

/// <summary>
/// Thrown when an AWS request fails because the SSO session used to resolve
/// credentials has expired or could not be loaded. Carries the AWS profile
/// name (when known) so callers can surface a targeted remediation hint.
/// </summary>
public class SsoSessionExpiredException : Exception
{
	/// <summary>
	/// Gets the AWS profile whose SSO session expired, or <c>null</c> when no
	/// profile was configured.
	/// </summary>
	public string? ProfileName { get; }

	/// <summary>Initializes a new instance for the given AWS profile.</summary>
	/// <param name="profileName">The AWS profile whose SSO session expired, or <c>null</c>.</param>
	public SsoSessionExpiredException(string? profileName)
		: base(BuildMessage(profileName))
	{
		ProfileName = profileName;
	}

	/// <summary>Initializes a new instance wrapping the underlying AWS exception.</summary>
	/// <param name="profileName">The AWS profile whose SSO session expired, or <c>null</c>.</param>
	/// <param name="innerException">The original AWS SDK exception.</param>
	public SsoSessionExpiredException(string? profileName, Exception innerException)
		: base(BuildMessage(profileName), innerException)
	{
		ProfileName = profileName;
	}

	private static string BuildMessage(string? profileName)
	{
		if (string.IsNullOrWhiteSpace(profileName))
		{
			return "Your AWS SSO session has expired. Run 'aws sso login' " +
				"and re-run this command.";
		}

		return $"Your AWS SSO session for profile '{profileName}' has expired. " +
			$"Run 'aws sso login --profile {profileName}' and re-run this command.";
	}
}