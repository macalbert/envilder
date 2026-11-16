import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { DependencyMissingError } from '../../domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
import { requiredFieldMessage } from '../../domain/ProviderConfiguration.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { AzureKeyVaultSecretProvider } from './AzureKeyVaultSecretProvider.js';

export function createAzureSecretProvider(
  config: MapFileConfig,
): ISecretProvider {
  const { vaultUrl } = config;
  if (!vaultUrl) {
    throw new DependencyMissingError(requiredFieldMessage('vaultUrl', 'azure'));
  }
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(vaultUrl, credential);
  return new AzureKeyVaultSecretProvider(client);
}
