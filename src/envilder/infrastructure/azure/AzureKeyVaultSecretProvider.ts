import type { SecretClient } from '@azure/keyvault-secrets';
import { injectable } from 'inversify';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';

/**
 * Azure Key Vault secret provider implementation.
 * Implements the same interface as AWS SSM provider for consistency.
 */
@injectable()
export class AzureKeyVaultSecretProvider implements ISecretProvider {
  private client: SecretClient;

  constructor(client: SecretClient) {
    this.client = client;
  }

  async getSecret(name: string): Promise<string | undefined> {
    try {
      const secretName = this.normalizeSecretName(name);
      const secret = await this.client.getSecret(secretName);
      return secret.value;
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
      throw new Error(`Failed to get secret ${name}: ${errorMessage}`);
    }
  }

  async setSecret(name: string, value: string): Promise<void> {
    const secretName = this.normalizeSecretName(name);
    await this.client.setSecret(secretName, value);
  }

  /**
   * Normalize secret name to comply with Azure Key Vault naming requirements.
   * Azure Key Vault secret names must:
   * - Be 1-127 characters long
   * - Contain only alphanumeric characters and hyphens
   * - Start with a letter
   */
  private normalizeSecretName(name: string): string {
    // Remove leading slashes
    let normalized = name.replace(/^\/+/, '');

    // Replace slashes and underscores with hyphens
    normalized = normalized.replace(/[/_]/g, '-');

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

    // Truncate to 127 characters
    if (normalized.length > 127) {
      normalized = normalized.substring(0, 127);
    }

    // Default name if empty
    if (normalized.length === 0) {
      normalized = 'secret';
    }

    return normalized;
  }
}
