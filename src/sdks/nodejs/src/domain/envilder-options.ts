import type { SecretProviderType } from './secret-provider-type.js';

export interface EnvilderOptions {
  provider?: SecretProviderType;
  vaultUrl?: string;
  profile?: string;
}
