import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { DependencyMissingError } from '../../domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
import { requiredFieldMessage } from '../../domain/ProviderConfiguration.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { AzureKeyVaultSecretProvider } from './AzureKeyVaultSecretProvider.js';
import {
  DEFAULT_VAULT_HOSTS,
  validateAzureVaultUrl,
} from './AzureVaultUrlValidator.js';

export { DEFAULT_VAULT_HOSTS } from './AzureVaultUrlValidator.js';

export type AzureProviderOptions = {
  allowedVaultHosts?: string[];
  disableChallengeResourceVerification?: boolean;
};

export function createAzureSecretProvider(
  config: MapFileConfig,
  options?: AzureProviderOptions,
): ISecretProvider {
  const { vaultUrl } = config;
  if (!vaultUrl) {
    throw new DependencyMissingError(requiredFieldMessage('vaultUrl', 'azure'));
  }
  const allowedVaultHosts = options?.allowedVaultHosts ?? DEFAULT_VAULT_HOSTS;
  const disableChallengeResourceVerification =
    options?.disableChallengeResourceVerification ?? false;
  validateAzureVaultUrl(vaultUrl, allowedVaultHosts);
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(vaultUrl, credential, {
    disableChallengeResourceVerification,
  });
  return new AzureKeyVaultSecretProvider(client);
}
