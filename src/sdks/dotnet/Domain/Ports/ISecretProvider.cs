namespace Envilder.Domain.Ports;

using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Abstracts access to a secret store (e.g. AWS SSM Parameter Store, Azure Key Vault).
/// Implement this interface to add support for a new secret provider.
/// </summary>
public interface ISecretProvider
{
    /// <summary>
    /// Retrieves a single secret by its name or path.
    /// </summary>
    /// <param name="name">
    /// Provider-specific identifier. For AWS SSM this is the parameter path
    /// (e.g. <c>/app/db-url</c>); for Azure Key Vault this is the secret name.
    /// </param>
    /// <param name="cancellationToken">Optional cancellation token.</param>
    /// <returns>
    /// The secret value, or <see langword="null"/> when the secret does not exist.
    /// </returns>
    Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Synchronously retrieves a single secret by its name or path.
    /// </summary>
    /// <param name="name">
    /// Provider-specific identifier (see <see cref="GetSecretAsync"/>).
    /// </param>
    /// <returns>
    /// The secret value, or <see langword="null"/> when the secret does not exist.
    /// </returns>
    string? GetSecret(string name);
}
