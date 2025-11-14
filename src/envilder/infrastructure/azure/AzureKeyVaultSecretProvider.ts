import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { injectable } from 'inversify';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';

@injectable()
export class AzureKeyVaultSecretProvider implements ISecretProvider {
  private client: SecretClient;

  constructor(vaultUrl: string) {
    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(vaultUrl, credential);
  }

  async getSecret(name: string): Promise<string | undefined> {
    try {
      // Azure Key Vault secret names must be alphanumeric and hyphens only
      // Convert the name to a valid format
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
    // Azure Key Vault secret names must be alphanumeric and hyphens only
    // Convert the name to a valid format
    const secretName = this.normalizeSecretName(name);
    await this.client.setSecret(secretName, value);
  }

  /**
   * Normalize secret name to be compatible with Azure Key Vault naming requirements.
   * Azure Key Vault secret names:
   * - Must be 1-127 characters long
   * - Can only contain alphanumeric characters and hyphens
   * - Must start with a letter
   * - Must not contain consecutive hyphens
   *
   * This function converts slashes and underscores to hyphens and ensures compliance.
   */
  private normalizeSecretName(name: string): string {
    // Remove leading slashes
    let normalized = name.replace(/^\/+/, '');

    // Replace slashes and underscores with hyphens
    normalized = normalized.replace(/[/_]/g, '-');

    // Remove any characters that are not alphanumeric or hyphens
    normalized = normalized.replace(/[^a-zA-Z0-9-]/g, '');

    // Replace consecutive hyphens with a single hyphen
    normalized = normalized.replace(/-+/g, '-');

    // Remove leading/trailing hyphens
    normalized = normalized.replace(/^-+|-+$/g, '');

    // Ensure it starts with a letter
    if (normalized.length > 0 && !/^[a-zA-Z]/.test(normalized)) {
      normalized = `secret-${normalized}`;
    }

    // Truncate to 127 characters if needed
    if (normalized.length > 127) {
      normalized = normalized.substring(0, 127);
    }

    // If still empty or invalid, use a default name
    if (normalized.length === 0) {
      normalized = 'secret';
    }

    return normalized;
  }
}
