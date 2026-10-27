import type { SecretClient } from '@azure/keyvault-secrets';
import { injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  InvalidArgumentError,
  SecretOperationError,
} from '../../domain/errors/DomainErrors.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { describeError } from '../describeError.js';

/**
 * A name Azure Key Vault accepts as it is: 1-127 letters, digits and hyphens.
 * @see https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
 */
const AZURE_SECRET_NAME = /^[0-9A-Za-z-]{1,127}$/;

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

  /**
   * Validates that the secret name meets Azure Key Vault naming constraints.
   * @see https://learn.microsoft.com/en-us/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
   */
  private validateSecretName(name: string): void {
    if (name.trim().length === 0) {
      throw new InvalidArgumentError(
        'Invalid secret name: name cannot be empty or whitespace-only.',
      );
    }
    if (/[^a-zA-Z0-9\-_/]/.test(name)) {
      throw new InvalidArgumentError(
        `Invalid secret name '${name}': contains characters not allowed` +
          ' by Azure Key Vault. Only alphanumeric characters,' +
          ' hyphens, slashes, and underscores are accepted.',
      );
    }
  }

  private resolveSecretName(originalName: string): string {
    this.validateSecretName(originalName);
    const normalized = this.normalizeSecretName(originalName);
    if (normalized.length > 127) {
      throw new InvalidArgumentError(
        `Invalid secret name '${originalName}': normalized name '${normalized}' exceeds the 127-character limit for Azure Key Vault.`,
      );
    }
    // Key Vault names are case-insensitive, so two references that differ
    // only by case still address the same secret.
    const registryKey = normalized.toLowerCase();
    const existing = this.normalizedNameRegistry.get(registryKey);
    if (existing !== undefined && existing !== originalName) {
      throw new SecretOperationError(
        `Secret name collision: '${originalName}' and '${existing}' ` +
          `both normalize to '${normalized}'. Use distinct ` +
          'Key Vault-compatible names in your map file ' +
          'when targeting Azure.',
      );
    }
    this.normalizedNameRegistry.set(registryKey, originalName);
    return normalized;
  }

  /**
   * A name Azure already accepts is used as written, so the CLI and every SDK
   * address the same secret: `Database--Password` and `1password-token` stay
   * as they are. Only a name Azure would reject (one holding `/` or `_`, or
   * longer than 127 characters) is rewritten, with the rules secrets pushed by
   * earlier versions were stored under: `/myapp/db_password` becomes
   * `myapp-db-password`.
   */
  private normalizeSecretName(name: string): string {
    if (AZURE_SECRET_NAME.test(name)) {
      return name;
    }

    // Remove leading slashes
    let normalized = name.replace(/^\/+/, '');

    // Replace slashes and underscores with hyphens
    normalized = normalized.replace(/[/_]/g, '-');

    // Lowercase to match Azure Key Vault case-insensitivity
    normalized = normalized.toLowerCase();

    // Remove invalid characters
    normalized = normalized.replace(/[^a-zA-Z0-9-]/g, '');

    // Remove consecutive hyphens
    normalized = normalized.replace(/-+/g, '-');

    // Remove leading/trailing hyphens
    normalized = normalized.replace(/^-+|-+$/g, '');

    // Ensure starts with a letter
    if (normalized.length > 0 && !/^[a-zA-Z]/.test(normalized)) {
      normalized = `secret-${normalized}`;
    }

    // Default name if empty
    if (normalized.length === 0) {
      normalized = 'secret';
    }

    return normalized;
  }
}
