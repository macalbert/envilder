import type { SecretClient } from '@azure/keyvault-secrets';
import type { SecretExistence } from '../../domain/contract-validation-result.js';
import type { ISecretExistenceChecker } from '../../domain/ports/secret-existence-checker.js';
import type { ISecretProvider } from '../../domain/ports/secret-provider.js';
import { describeError } from '../describe-error.js';
import { toAzureSecretName } from './azure-secret-name.js';

/**
 * {@link ISecretProvider} backed by Azure Key Vault.
 *
 * Secrets are fetched in parallel. Secrets that return HTTP 404
 * are treated as missing and silently omitted from the result.
 * Each reference is mapped to its Key Vault name with
 * {@link toAzureSecretName}, the same rule the CLI uses.
 */
export class AzureKeyVaultSecretProvider
  implements ISecretProvider, ISecretExistenceChecker
{
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
        throw new Error('Secret name cannot be null or empty');
      }
    }
    const secretNames = names.map(toAzureSecretName);

    const entries = await Promise.all(
      names.map(async (name, index) => {
        const value = await this.fetchSecret(secretNames[index]);
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

  /**
   * Lists the vault's secret names once, which reads metadata only, and
   * matches every name against it the way Key Vault does, ignoring case. A
   * disabled secret cannot be read, so it counts as missing. Needs the `List`
   * secret permission (access policies) or
   * `Microsoft.KeyVault/vaults/secrets/readMetadata/action` (Azure RBAC,
   * included in Key Vault Secrets User).
   */
  async checkSecretsExist(
    names: readonly string[],
  ): Promise<ReadonlyMap<string, SecretExistence>> {
    const results = new Map<string, SecretExistence>();
    const distinct = [...new Set(names)];
    if (distinct.length === 0) {
      return results;
    }

    let enabled: Set<string>;
    try {
      enabled = await this.listEnabledSecretNames();
    } catch (error) {
      const existence = toExistence(error);
      for (const name of distinct) {
        results.set(name, existence);
      }
      return results;
    }
    for (const name of distinct) {
      const secretName = toAzureSecretName(name).toLowerCase();
      results.set(name, {
        status: enabled.has(secretName) ? 'exists' : 'missing',
      });
    }
    return results;
  }

  private async listEnabledSecretNames(): Promise<Set<string>> {
    const enabled = new Set<string>();
    for await (const properties of this.secretClient.listPropertiesOfSecrets()) {
      if (properties.enabled !== false) {
        enabled.add(properties.name.toLowerCase());
      }
    }
    return enabled;
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

const AUTHENTICATION_ERROR_NAMES = new Set([
  'CredentialUnavailableError',
  'AuthenticationError',
  'AuthenticationRequiredError',
  'AggregateAuthenticationError',
]);

function toExistence(error: unknown): SecretExistence {
  const reason = describeError(error);
  const statusCode =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? error.statusCode
      : undefined;
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String(error.name)
      : '';
  if (statusCode === 403) {
    return { status: 'access_denied', reason };
  }
  if (statusCode === 401 || AUTHENTICATION_ERROR_NAMES.has(name)) {
    return { status: 'authentication_failed', reason };
  }
  return { status: 'provider_error', reason };
}
