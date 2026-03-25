import type { SecretClient } from '@azure/keyvault-secrets';
import { injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  InvalidArgumentError,
  SecretOperationError,
} from '../../domain/errors/DomainErrors.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';

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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SecretOperationError(
        `Failed to get secret ${EnvironmentVariable.maskSecretPath(name)}: ${errorMessage}`,
      );
    }
  }

  async setSecret(name: string, value: string): Promise<void> {
    const secretName = this.resolveSecretName(name);
    try {
      await this.client.setSecret(secretName, value);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SecretOperationError(
        `Failed to set secret ${EnvironmentVariable.maskSecretPath(name)}: ${errorMessage}`,
      );
    }
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
    const existing = this.normalizedNameRegistry.get(normalized);
    if (existing !== undefined && existing !== originalName) {
      throw new SecretOperationError(
        `Secret name collision: '${originalName}' and '${existing}' ` +
          `both normalize to '${normalized}'. Use distinct ` +
          'Key Vault-compatible names in your map file ' +
          'when targeting Azure.',
      );
    }
    this.normalizedNameRegistry.set(normalized, originalName);
    return normalized;
  }

  // Azure Key Vault secret names: 1-127 chars, alphanumeric + hyphens, start with letter
  private normalizeSecretName(name: string): string {
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
