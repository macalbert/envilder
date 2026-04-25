import type { SecretClient } from '@azure/keyvault-secrets';
import type { ISecretProvider } from '../../domain/ports/secret-provider.js';

/**
 * {@link ISecretProvider} backed by Azure Key Vault.
 *
 * Secrets that return HTTP 404 are treated as missing and yield `null`.
 */
export class AzureKeyVaultSecretProvider implements ISecretProvider {
  private readonly secretClient: SecretClient;

  constructor(secretClient: SecretClient) {
    if (!secretClient) {
      throw new Error('secretClient cannot be null');
    }
    this.secretClient = secretClient;
  }

  async getSecret(name: string): Promise<string | null> {
    if (!name?.trim()) {
      throw new Error('Secret name cannot be null or empty.');
    }

    try {
      const response = await this.secretClient.getSecret(name);
      return response.value ?? null;
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    (error as { statusCode: number }).statusCode === 404
  );
}
