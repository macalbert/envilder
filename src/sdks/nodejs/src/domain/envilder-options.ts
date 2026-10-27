import type { SecretProviderType } from './secret-provider-type.js';

export interface EnvilderOptions {
  provider?: SecretProviderType;
  vaultUrl?: string;
  profile?: string;
  /**
   * Extra Azure Key Vault host suffixes to trust on top of the public, China,
   * US Government and Germany cloud hosts (e.g. `.localhost.localstack.cloud`).
   */
  allowedVaultHosts?: string[];
}
