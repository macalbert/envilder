import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { DependencyMissingError } from '../../domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { AzureKeyVaultSecretProvider } from './AzureKeyVaultSecretProvider.js';

export function createAzureSecretProvider(
  config: MapFileConfig,
): ISecretProvider {
  const { vaultUrl } = config;
  if (!vaultUrl) {
    throw new DependencyMissingError(
      'vaultUrl is required when using Azure provider.' +
        ' Set it in $config.vaultUrl in your map file' +
        ' or via --vault-url flag.',
    );
  }
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(vaultUrl, credential);
  return new AzureKeyVaultSecretProvider(client);
}
