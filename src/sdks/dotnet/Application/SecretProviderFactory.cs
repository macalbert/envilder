namespace Envilder.Application;

using Amazon.Runtime.CredentialManagement;
using Amazon.SimpleSystemsManagement;
using Azure.Identity;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;
using System;

public static class SecretProviderFactory
{
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