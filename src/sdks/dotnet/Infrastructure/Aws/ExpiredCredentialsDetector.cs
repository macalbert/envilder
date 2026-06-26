namespace Envilder.Infrastructure.Aws;

using Amazon.Runtime;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

internal static class ExpiredCredentialsDetector
{
	private static readonly HashSet<string> ExpiredErrorCodes = new(StringComparer.OrdinalIgnoreCase)
	{
		"ExpiredTokenException",
		"ExpiredToken",
		"UnrecognizedClient",
		"UnrecognizedClientException",
		"InvalidClientTokenId",
		"RequestExpired",
	};

	private static readonly Regex MessagePattern = new(
		"expired|token has expired|sso session|refresh failed|could not be refreshed|" +
		"unable to load credentials|invalid.*security token|security token.*invalid",
		RegexOptions.IgnoreCase | RegexOptions.Compiled);

	public static bool IsExpiredCredentials(Exception exception)
	{
		if (exception is AmazonServiceException serviceException
			&& serviceException.ErrorCode is not null
			&& ExpiredErrorCodes.Contains(serviceException.ErrorCode))
		{
			return true;
		}

		return MessagePattern.IsMatch(exception.Message);
	}
}