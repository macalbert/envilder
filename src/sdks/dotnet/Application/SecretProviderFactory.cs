namespace Envilder.Application;

using System;
using Amazon.SimpleSystemsManagement;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Envilder.Domain;
using Envilder.Domain.Ports;
using Envilder.Infrastructure.Aws;
using Envilder.Infrastructure.Azure;

public class SecretProviderFactory
{
    public ISecretProvider Create(MapFileConfig config, EnvilderOptions? options = null)
    {
        var provider = options?.Provider ?? config.Provider;
        var vaultUrl = options?.VaultUrl ?? config.VaultUrl;

        if (string.Equals(provider, "azure", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(vaultUrl))
            {
                throw new InvalidOperationException("VaultUrl is required when using the Azure provider.");
            }

            var client = new SecretClient(new Uri(vaultUrl), new DefaultAzureCredential());
            return new AzureKeyVaultSecretProvider(client);
        }

        return new AwsSsmSecretProvider(new AmazonSimpleSystemsManagementClient());
    }
}
