namespace Envilder.Infrastructure.Aws;

using System;
using System.Collections.Generic;

internal static class SsoSessionExpiredDetector
{
	private static readonly HashSet<string> SsoSessionExpiredTypeNames = new(StringComparer.OrdinalIgnoreCase)
	{
		"UnauthorizedClientException",
		"InvalidGrantException",
	};

	public static bool IsSsoSessionExpired(Exception? exception)
	{
		for (var current = exception; current is not null; current = current.InnerException)
		{
			if (SsoSessionExpiredTypeNames.Contains(current.GetType().Name))
			{
				return true;
			}
		}

		return false;
	}
}