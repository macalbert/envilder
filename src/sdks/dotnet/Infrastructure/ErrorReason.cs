namespace Envilder.Infrastructure;

using System;

internal static class ErrorReason
{
	/// <summary>
	/// The exception message, or its type name when the message is empty, so a
	/// reason is never blank.
	/// </summary>
	public static string Describe(Exception exception)
	{
		return string.IsNullOrWhiteSpace(exception.Message)
			? exception.GetType().Name
			: exception.Message;
	}
}