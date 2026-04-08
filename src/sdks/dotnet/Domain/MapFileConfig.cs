namespace Envilder.Domain;

public class MapFileConfig
{
    public SecretProviderType? Provider { get; init; }
    public string? VaultUrl { get; init; }
    public string? Profile { get; init; }
}
