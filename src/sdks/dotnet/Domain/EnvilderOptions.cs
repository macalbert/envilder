namespace Envilder.Domain;

public class EnvilderOptions
{
    public SecretProviderType? Provider { get; set; }
    public string? VaultUrl { get; set; }
    public string? Profile { get; set; }
    public string? Region { get; set; }
}
