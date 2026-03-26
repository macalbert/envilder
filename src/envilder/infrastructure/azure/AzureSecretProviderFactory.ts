import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { DependencyMissingError } from '../../domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
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
    throw new DependencyMissingError(
      'vaultUrl is required when using Azure provider.' +
        ' Set it in $config.vaultUrl in your map file' +
        ' or via --vault-url flag.',
    );
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
