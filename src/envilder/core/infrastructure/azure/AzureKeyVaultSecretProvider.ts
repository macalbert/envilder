import type { SecretClient } from '@azure/keyvault-secrets';
import { injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  InvalidArgumentError,
  SecretOperationError,
} from '../../domain/errors/DomainErrors.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { describeError } from '../describeError.js';

@injectable()
export class AzureKeyVaultSecretProvider implements ISecretProvider {
  private client: SecretClient;
  private normalizedNameRegistry = new Map<string, string>();

  constructor(client: SecretClient) {
    this.client = client;
  }

  async getSecret(name: string): Promise<string | undefined> {
    const secretName = this.resolveSecretName(name);
    try {
      const secret = await this.client.getSecret(secretName);
      return secret?.value ?? undefined;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        error.statusCode === 404
      ) {
        return undefined;
      }
      throw new SecretOperationError(
        `${EnvironmentVariable.maskSecretPath(name)}: ${describeError(error)}`,
      );
    }
  }

  async setSecret(name: string, value: string): Promise<void> {
    const secretName = this.resolveSecretName(name);
    await this.client.setSecret(secretName, value);
  }

  private resolveSecretName(originalName: string): string {
    if (originalName.trim().length === 0) {
      throw new InvalidArgumentError(
        'Invalid secret name: name cannot be empty or whitespace-only.',
      );
    }
    const normalized = toAzureSecretName(originalName);
    // Key Vault names are case-insensitive, so two references that differ
    // only by case still address the same secret.
    const registryKey = normalized.toLowerCase();
    const existing = this.normalizedNameRegistry.get(registryKey);
    if (existing !== undefined && existing !== originalName) {
      throw new SecretOperationError(
        `Secret name collision: '${originalName}' and '${existing}' ` +
          `both resolve to '${normalized}'. Use distinct ` +
          'Key Vault secret names in your map file ' +
          'when targeting Azure.',
      );
    }
    this.normalizedNameRegistry.set(registryKey, originalName);
    return normalized;
  }
}

/**
 * The only translation between a map-file reference and a Key Vault secret
 * name, shared with every SDK: `/` becomes `-`, ignoring leading slashes, so
 * a path-style reference such as `/myapp/db/password` reads
 * `myapp-db-password`. Anything else reaches Key Vault as written, and a
 * name it does not accept fails with Key Vault's own error.
 * @see https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
 */
export function toAzureSecretName(name: string): string {
  return name.replace(/^\/+/, '').replace(/\//g, '-');
}
