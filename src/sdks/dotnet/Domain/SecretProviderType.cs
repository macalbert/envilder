namespace Envilder.Domain;

/// <summary>
/// Supported secret provider backends.
/// </summary>
public enum SecretProviderType
{
    /// <summary>AWS Systems Manager Parameter Store.</summary>
    Aws,

    /// <summary>Azure Key Vault.</summary>
    Azure,
}
