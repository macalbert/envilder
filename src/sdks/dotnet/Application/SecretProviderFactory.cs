namespace Envilder.Application;

using Amazon.Runtime.CredentialManagement;
using Amazon.SimpleSystemsManagement;
using Azure.Identity;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;
using System;

/// <summary>
/// Creates the appropriate <see cref="ISecretProvider"/> implementation
/// based on the map file configuration and optional runtime overrides.
/// </summary>
public static class SecretProviderFactory
{
    /// <summary>
    /// Creates an <see cref="ISecretProvider"/> for the provider specified in
    /// <paramref name="config"/>. When <paramref name="options"/> is provided,
    /// its values take precedence over <paramref name="config"/>.
    /// </summary>
    /// <param name="config">Configuration from the <c>$config</c> section of a map file.</param>
    /// <param name="options">Optional runtime overrides (e.g. CLI flags).</param>
    /// <returns>A ready-to-use secret provider.</returns>
    /// <exception cref="InvalidOperationException">
    /// Thrown when Azure is selected but no Vault URL is provided.
    /// </exception>
    public static ISecretProvider Create(MapFileConfig config, EnvilderOptions? options = null)
    {
        var provider = options?.Provider ?? config.Provider;

        return provider switch
        {
            SecretProviderType.Azure => CreateAzureSecretProvider(config, options),
            _ => CreateAwsSecretProvider(config, options),
        };
    }

    private static AzureKeyVaultSecretProvider CreateAzureSecretProvider(MapFileConfig config, EnvilderOptions? options)
    {
        var vaultUrl = (options?.VaultUrl ?? config.VaultUrl)
            ?? throw new InvalidOperationException("Vault URL must be provided for Azure Key Vault provider.");

        return new(new(new(vaultUrl), new DefaultAzureCredential()));
    }

    private static AwsSsmSecretProvider CreateAwsSecretProvider(MapFileConfig config, EnvilderOptions? options)
    {
        var profile = options?.Profile ?? config.Profile;

        if (!string.IsNullOrWhiteSpace(profile))
        {
            var chain = new CredentialProfileStoreChain();
            if (chain.TryGetAWSCredentials(profile, out var credentials))
            {
                return new(new AmazonSimpleSystemsManagementClient(credentials));
            }
        }

        return new(new AmazonSimpleSystemsManagementClient());
    }
}