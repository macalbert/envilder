namespace Envilder.Infrastructure.Aws;

using Amazon.Runtime;
using System;
using System.Collections.Generic;

internal static class ExpiredCredentialsDetector
{
	private static readonly HashSet<string> ExpiredErrorCodes = new(StringComparer.OrdinalIgnoreCase)
	{
		"ExpiredTokenException",
		"ExpiredToken",
		"UnrecognizedClient",
		"UnrecognizedClientException",
		"InvalidClientTokenId",
		"InvalidSignatureException",
		"RequestExpired",
	};

	private static readonly HashSet<string> ExpiredExceptionTypeNames = new(StringComparer.OrdinalIgnoreCase)
	{
		"ExpiredTokenException",
		"UnauthorizedException",
		"UnauthorizedClientException",
		"InvalidGrantException",
	};

	public static bool IsExpiredCredentials(Exception? exception)
	{
		for (var current = exception; current is not null; current = current.InnerException)
		{
			if (ExpiredExceptionTypeNames.Contains(current.GetType().Name))
			{
				return true;
			}

			if (current is AmazonServiceException serviceException
				&& serviceException.ErrorCode is not null
				&& ExpiredErrorCodes.Contains(serviceException.ErrorCode))
			{
				return true;
			}
		}

		return false;
	}
}