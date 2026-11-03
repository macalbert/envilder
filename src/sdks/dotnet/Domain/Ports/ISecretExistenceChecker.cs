namespace Envilder.Domain.Ports;

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Checks whether secrets exist without reading their values. Implemented by
/// the built-in providers and used by contract validation; kept apart from
/// <see cref="ISecretProvider"/> so custom providers do not have to
/// implement it.
/// </summary>
internal interface ISecretExistenceChecker
{
	/// <summary>
	/// Returns one entry per distinct name. Expected failures (missing secret,
	/// access denied, rejected credentials, unreachable provider) become the
	/// status of the names they affect instead of being thrown. Cancellation
	/// is the exception: it propagates.
	/// </summary>
	/// <param name="names">The secret paths to check.</param>
	/// <param name="cancellationToken">Token observed by every provider call.</param>
	/// <returns>The outcome per name.</returns>
	Task<IReadOnlyDictionary<string, SecretExistence>> CheckSecretsExistAsync(
		IReadOnlyCollection<string> names,
		CancellationToken cancellationToken);
}