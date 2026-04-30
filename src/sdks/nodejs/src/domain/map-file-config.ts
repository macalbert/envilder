import type { SecretProviderType } from './secret-provider-type.js';

export interface MapFileConfig {
  readonly provider?: SecretProviderType;
  readonly vaultUrl?: string;
  readonly profile?: string;
}
