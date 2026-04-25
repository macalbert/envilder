import { SSMClient } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import type { EnvilderOptions } from '../domain/envilder-options.js';
import type { MapFileConfig } from '../domain/map-file-config.js';
import type { ISecretProvider } from '../domain/ports/secret-provider.js';
import { SecretProviderType } from '../domain/secret-provider-type.js';
import { AwsSsmSecretProvider } from './aws/aws-ssm-secret-provider.js';
import { AzureKeyVaultSecretProvider } from './azure/azure-key-vault-secret-provider.js';

export function createSecretProvider(
  config: MapFileConfig,
  options?: EnvilderOptions,
): ISecretProvider {
  const provider = options?.provider ?? config.provider;
  const profile = options?.profile ?? config.profile;
  const vaultUrl = options?.vaultUrl ?? config.vaultUrl;
  const isAzure = provider === SecretProviderType.Azure;

  if (isAzure && profile) {
    throw new Error(
      'AWS profile cannot be used with Azure Key Vault provider.',
    );
  }

  if (!isAzure && vaultUrl) {
    throw new Error('Vault URL cannot be used with AWS SSM provider.');
  }

  if (isAzure) {
    return createAzureProvider(vaultUrl);
  }

  return createAwsProvider(profile);
}

function createAzureProvider(
  vaultUrl: string | undefined,
): AzureKeyVaultSecretProvider {
  if (!vaultUrl || !vaultUrl.trim()) {
    throw new Error('Vault URL must be provided for Azure Key Vault provider.');
  }

  const credential = new DefaultAzureCredential();
  const client = new SecretClient(vaultUrl, credential);
  return new AzureKeyVaultSecretProvider(client);
}

function createAwsProvider(profile: string | undefined): AwsSsmSecretProvider {
  const clientOptions = profile ? { credentials: fromIni({ profile }) } : {};
  const client = new SSMClient(clientOptions);
  return new AwsSsmSecretProvider(client);
}
