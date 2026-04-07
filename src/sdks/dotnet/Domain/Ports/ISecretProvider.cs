namespace Envilder.Domain.Ports;

using System.Threading;
using System.Threading.Tasks;

public interface ISecretProvider
{
    Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default);
}
