namespace Envilder;

using System;

/// <summary>
/// Thrown when an AWS request fails because the credentials or security token
/// are expired or invalid (for example, an expired SSO session).
/// </summary>
public class ExpiredCredentialsException : Exception
{
	private const string RemediationMessage =
		"AWS credentials are expired or invalid. Your security token or SSO " +
		"session may have expired. Refresh your credentials and retry " +
		"(for SSO, run: aws sso login).";

	/// <summary>Initializes a new instance with the default remediation message.</summary>
	public ExpiredCredentialsException()
		: base(RemediationMessage)
	{
	}

	/// <summary>Initializes a new instance with a custom message.</summary>
	/// <param name="message">The error message.</param>
	public ExpiredCredentialsException(string message)
		: base(message)
	{
	}

	/// <summary>Initializes a new instance wrapping the underlying AWS exception.</summary>
	/// <param name="innerException">The original AWS SDK exception.</param>
	public ExpiredCredentialsException(Exception innerException)
		: base(RemediationMessage, innerException)
	{
	}

	/// <summary>Initializes a new instance with a custom message and inner exception.</summary>
	/// <param name="message">The error message.</param>
	/// <param name="innerException">The original AWS SDK exception.</param>
	public ExpiredCredentialsException(string message, Exception innerException)
		: base(message, innerException)
	{
	}
}