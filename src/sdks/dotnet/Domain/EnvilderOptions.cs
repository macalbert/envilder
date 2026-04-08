namespace Envilder.Domain;

/// <summary>
/// Runtime overrides supplied by the consumer (e.g. CLI flags).
/// Values set here take precedence over <see cref="MapFileConfig"/>.
/// </summary>
public class EnvilderOptions
{
    /// <summary>
    /// Override the secret provider backend defined in the map file.
    /// </summary>
    public SecretProviderType? Provider { get; set; }

    /// <summary>
    /// Override the Azure Key Vault URL defined in the map file.
    /// </summary>
    public string? VaultUrl { get; set; }

    /// <summary>
    /// Override the AWS named profile defined in the map file.
    /// </summary>
    public string? Profile { get; set; }
}
