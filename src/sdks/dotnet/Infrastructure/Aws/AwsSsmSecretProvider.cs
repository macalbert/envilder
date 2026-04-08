namespace Envilder.Infrastructure.Aws;

using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using Envilder.Domain.Ports;
using System.Threading;
using System.Threading.Tasks;

public class AwsSsmSecretProvider : ISecretProvider
{
    private readonly IAmazonSimpleSystemsManagement _ssmClient;

    public AwsSsmSecretProvider(IAmazonSimpleSystemsManagement ssmClient)
    {
        _ssmClient = ssmClient;
    }

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