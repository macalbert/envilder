import type { SecretClient } from '@azure/keyvault-secrets';
import { injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  InvalidArgumentError,
  SecretOperationError,
} from '../../domain/errors/DomainErrors.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { SecretExistence } from '../../domain/SecretExistence.js';
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
    const secretNames = new Map<string, string>();
    for (const name of new Set(names)) {
      try {
        secretNames.set(name, this.resolveSecretName(name).toLowerCase());
      } catch (error) {
        results.set(name, {
          status: 'provider_error',
          reason: describeError(error),
        });
      }
    }
    if (secretNames.size === 0) {
      return results;
    }

    let enabled: Set<string>;
    try {
      enabled = await this.listEnabledSecretNames();
    } catch (error) {
      const existence = toExistence(error);
      for (const name of secretNames.keys()) {
        results.set(name, existence);
      }
      return results;
    }
    for (const [name, secretName] of secretNames) {
      results.set(name, {
        status: enabled.has(secretName) ? 'exists' : 'missing',
      });
    }
    return results;
  }

  private async listEnabledSecretNames(): Promise<Set<string>> {
    const enabled = new Set<string>();
    for await (const properties of this.client.listPropertiesOfSecrets()) {
      if (properties.enabled !== false) {
        enabled.add(properties.name.toLowerCase());
      }
    }
    return enabled;
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
