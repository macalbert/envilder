// Domain
export type { EnvilderOptions } from './domain/envilder-options.js';
export type { MapFileConfig } from './domain/map-file-config.js';
export type { ParsedMapFile } from './domain/parsed-map-file.js';
export type { ISecretProvider } from './domain/ports/secret-provider.js';
export { SecretProviderType } from './domain/secret-provider-type.js';

// Application
export { Envilder } from './application/envilder.js';
export { EnvilderClient } from './application/envilder-client.js';
export { MapFileParser } from './application/map-file-parser.js';
export {
  SecretValidationError,
  validateSecrets,
} from './application/secret-validation.js';

// Infrastructure (for advanced usage)
export { AwsSsmSecretProvider } from './infrastructure/aws/aws-ssm-secret-provider.js';
export { AzureKeyVaultSecretProvider } from './infrastructure/azure/azure-key-vault-secret-provider.js';
