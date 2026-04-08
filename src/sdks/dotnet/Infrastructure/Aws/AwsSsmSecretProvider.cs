namespace Envilder.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using Envilder.Domain.Ports;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// <see cref="ISecretProvider"/> backed by AWS Systems Manager Parameter Store.
/// Parameters are retrieved with decryption enabled so that <c>SecureString</c>
/// values are returned in plain text.
/// </summary>
public class AwsSsmSecretProvider : ISecretProvider
{
    private readonly IAmazonSimpleSystemsManagement _ssmClient;

    /// <summary>
    /// Initializes a new instance using the supplied SSM client.
    /// </summary>
    /// <param name="ssmClient">A configured <see cref="IAmazonSimpleSystemsManagement"/> instance.</param>
    public AwsSsmSecretProvider(IAmazonSimpleSystemsManagement ssmClient)
    {
        _ssmClient = ssmClient;
    }

    /// <inheritdoc />
    public async Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _ssmClient.GetParameterAsync(new() { Name = name, WithDecryption = true }, cancellationToken);
            return response.Parameter.Value;
        }
        catch (ParameterNotFoundException)
        {
            return null;
        }
    }
}