using System.Threading;
using System.Threading.Tasks;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using Envilder.Domain.Ports;

namespace Envilder.Infrastructure;

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
            var response = await _ssmClient.GetParameterAsync(
                new GetParameterRequest { Name = name, WithDecryption = true },
                cancellationToken);
            return response.Parameter.Value;
        }
        catch (ParameterNotFoundException)
        {
            return null;
        }
    }
}
