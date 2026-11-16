namespace Envilder.Infrastructure.Aws;

using Amazon.Runtime;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using global::Envilder.Domain.Ports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// <see cref="ISecretProvider"/> backed by AWS Systems Manager Parameter Store.
/// Parameters are retrieved with decryption enabled so that <c>SecureString</c>
/// values are returned in plain text.
/// </summary>
public class AwsSsmSecretProvider : ISecretProvider, ISecretExistenceChecker
{
	private const int BatchSize = 10;

	private static readonly HashSet<string> AuthenticationErrorCodes = new(StringComparer.OrdinalIgnoreCase)
	{
		"UnrecognizedClientException",
		"InvalidClientTokenId",
		"InvalidSignatureException",
		"IncompleteSignatureException",
	};

	// Raised by the AWS SDK itself, before any request, when its credential
	// chain finds nothing. It carries no error code, so the message is the signal.
	private static readonly string[] MissingCredentialsMessages =
	[
		"Unable to find credentials",
		"Credentials must be set",
		"Unable to get IAM security credentials",
	];

	private readonly IAmazonSimpleSystemsManagement _ssmClient;
	private readonly string? _profile;

	/// <summary>
	/// Initializes a new instance using the supplied SSM client.
	/// </summary>
	/// <param name="ssmClient">A configured <see cref="IAmazonSimpleSystemsManagement"/> instance.</param>
	/// <param name="profile">The AWS profile in use, surfaced when an SSO session has expired.</param>
	public AwsSsmSecretProvider(IAmazonSimpleSystemsManagement ssmClient, string? profile = null)
	{
		_ssmClient = ssmClient ?? throw new ArgumentNullException(nameof(ssmClient));
		_profile = profile;
	}

	/// <inheritdoc />
	public async Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			throw new ArgumentException("Secret name cannot be null or whitespace.", nameof(name));
		}

		try
		{
			var response = await _ssmClient.GetParameterAsync(new() { Name = name, WithDecryption = true }, cancellationToken);
			return response.Parameter.Value;
		}
		catch (ParameterNotFoundException)
		{
			return null;
		}
		catch (Exception ex) when (SsoSessionExpiredDetector.IsSsoSessionExpired(ex))
		{
			throw new SsoSessionExpiredException(_profile, ex);
		}
		catch (Exception ex) when (ExpiredCredentialsDetector.IsExpiredCredentials(ex))
		{
			throw new ExpiredCredentialsException(ex);
		}
	}

	/// <inheritdoc />
	public string? GetSecret(string name)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			throw new ArgumentException("Secret name cannot be null or whitespace.", nameof(name));
		}

		try
		{
			using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
#pragma warning disable VSTHRD002 // AWS SDK v4 has no synchronous GetParameter API
			var response = Task.Run(() => _ssmClient.GetParameterAsync(new() { Name = name, WithDecryption = true }, cts.Token)).GetAwaiter().GetResult();
#pragma warning restore VSTHRD002
			return response.Parameter.Value;
		}
		catch (ParameterNotFoundException)
		{
			return null;
		}
		catch (Exception ex) when (SsoSessionExpiredDetector.IsSsoSessionExpired(ex))
		{
			throw new SsoSessionExpiredException(_profile, ex);
		}
		catch (Exception ex) when (ExpiredCredentialsDetector.IsExpiredCredentials(ex))
		{
			throw new ExpiredCredentialsException(ex);
		}
	}

	/// <summary>
	/// Uses <c>GetParameters</c> in batches of 10 with decryption off: the names
	/// it cannot find come back as invalid parameters, and the values it
	/// returns are never read. Needs <c>ssm:GetParameters</c> on the parameters.
	/// </summary>
	async Task<IReadOnlyDictionary<string, SecretExistence>> ISecretExistenceChecker.CheckSecretsExistAsync(
		IReadOnlyCollection<string> names,
		CancellationToken cancellationToken)
	{
		var results = new Dictionary<string, SecretExistence>();
		var distinct = names.Distinct().ToList();
		for (var i = 0; i < distinct.Count; i += BatchSize)
		{
			var batch = distinct.Skip(i).Take(BatchSize).ToList();
			foreach (var (name, existence) in await CheckBatchAsync(batch, cancellationToken).ConfigureAwait(false))
			{
				results[name] = existence;
			}
		}

		return results;
	}

	private async Task<List<(string Name, SecretExistence Existence)>> CheckBatchAsync(
		List<string> batch,
		CancellationToken cancellationToken)
	{
		try
		{
			var response = await _ssmClient
				.GetParametersAsync(new() { Names = batch, WithDecryption = false }, cancellationToken)
				.ConfigureAwait(false);
			var missing = new HashSet<string>(response.InvalidParameters ?? []);
			return batch
				.Select(name => (name, new SecretExistence(
					missing.Contains(name) ? SecretExistenceStatus.Missing : SecretExistenceStatus.Exists)))
				.ToList();
		}
		catch (Exception ex)
		{
			// Only the caller's cancellation propagates: a client timeout also surfaces
			// as a canceled task, and is reported as a provider error.
			cancellationToken.ThrowIfCancellationRequested();

			// One name can fail the whole call, so each is checked on its own to tell which.
			if (batch.Count > 1 && FailsPerName(ex))
			{
				var perName = new List<(string Name, SecretExistence Existence)>();
				foreach (var name in batch)
				{
					perName.AddRange(await CheckBatchAsync([name], cancellationToken).ConfigureAwait(false));
				}

				return perName;
			}

			var existence = ToExistence(ex);
			return batch.Select(name => (name, existence)).ToList();
		}
	}

	private static bool FailsPerName(Exception exception)
	{
		return exception is AmazonServiceException { ErrorCode: "AccessDeniedException" or "ValidationException" };
	}

	private SecretExistence ToExistence(Exception exception)
	{
		// Expired credentials are a credentials problem: reported, not thrown,
		// with the same remediation a load gives.
		if (SsoSessionExpiredDetector.IsSsoSessionExpired(exception))
		{
			return new(
				SecretExistenceStatus.AuthenticationFailed,
				new SsoSessionExpiredException(_profile, exception).Message);
		}

		if (ExpiredCredentialsDetector.IsExpiredCredentials(exception))
		{
			return new(
				SecretExistenceStatus.AuthenticationFailed,
				new ExpiredCredentialsException(exception).Message);
		}

		var reason = ErrorReason.Describe(exception);
		var errorCode = (exception as AmazonServiceException)?.ErrorCode;
		if (string.Equals(errorCode, "AccessDeniedException", StringComparison.OrdinalIgnoreCase))
		{
			return new(SecretExistenceStatus.AccessDenied, reason);
		}

		if ((errorCode is not null && AuthenticationErrorCodes.Contains(errorCode))
			|| IsMissingCredentials(exception))
		{
			return new(SecretExistenceStatus.AuthenticationFailed, reason);
		}

		return new(SecretExistenceStatus.ProviderError, reason);
	}

	private static bool IsMissingCredentials(Exception exception)
	{
		for (var current = exception; current is not null; current = current.InnerException)
		{
			if (current is AmazonServiceException or AmazonClientException
				&& MissingCredentialsMessages.Any(message =>
					current.Message.StartsWith(message, StringComparison.Ordinal)))
			{
				return true;
			}
		}

		return false;
	}
}