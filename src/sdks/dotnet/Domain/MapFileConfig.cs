namespace Envilder.Domain;

/// <summary>
/// Configuration read from the <c>$config</c> section of a map file.
/// All properties are optional; sensible defaults are applied when absent.
/// </summary>
public class MapFileConfig
{
    /// <summary>
    /// Secret provider backend. Defaults to <see cref="SecretProviderType.Aws"/> when <see langword="null"/>.
    /// </summary>
    public SecretProviderType? Provider { get; set; }

    /// <summary>
    /// Azure Key Vault URL (e.g. <c>https://my-vault.vault.azure.net</c>).
    /// Required when <see cref="Provider"/> is <see cref="SecretProviderType.Azure"/>.
    /// </summary>
    public string? VaultUrl { get; set; }

    /// <summary>
    /// AWS named profile used to resolve credentials from the local credential store.
    /// When <see langword="null"/> the default credential chain is used.
    /// </summary>
    public string? Profile { get; set; }
}