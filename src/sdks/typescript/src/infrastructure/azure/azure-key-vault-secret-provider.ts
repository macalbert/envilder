import type { SecretClient } from '@azure/keyvault-secrets';
import type { ISecretProvider } from '../../domain/ports/secret-provider.js';

/**
 * {@link ISecretProvider} backed by Azure Key Vault.
 *
 * Secrets are fetched in parallel. Secrets that return HTTP 404
 * are treated as missing and silently omitted from the result.
 */
export class AzureKeyVaultSecretProvider implements ISecretProvider {
  private readonly secretClient: SecretClient;

  constructor(secretClient: SecretClient) {
    if (!secretClient) {
      throw new Error('secretClient cannot be null');
    }
    this.secretClient = secretClient;
  }

  async getSecrets(names: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (names.length === 0) {
      return result;
    }

    for (const name of names) {
      if (!name?.trim()) {
        throw new Error('Secret name cannot be null or empty.');
      }
    }

    const entries = await Promise.all(
      names.map(async (name) => {
        const value = await this.fetchSecret(name);
        return [name, value] as const;
      }),
    );

    for (const [name, value] of entries) {
      if (value !== null) {
        result.set(name, value);
      }
    }

    return result;
  }

  private async fetchSecret(name: string): Promise<string | null> {
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
