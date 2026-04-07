using System.Threading;
using System.Threading.Tasks;

namespace Envilder.Domain.Ports;

public interface ISecretProvider
{
    Task<string?> GetSecretAsync(string name, CancellationToken cancellationToken = default);
}
