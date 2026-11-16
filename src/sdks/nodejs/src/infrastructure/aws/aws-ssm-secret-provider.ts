import { GetParametersCommand, type SSMClient } from '@aws-sdk/client-ssm';
import type { SecretExistence } from '../../domain/contract-validation-result.js';
import {
  ExpiredCredentialsError,
  isExpiredCredentialsError,
} from '../../domain/expired-credentials-error.js';
import type { ISecretExistenceChecker } from '../../domain/ports/secret-existence-checker.js';
import type { ISecretProvider } from '../../domain/ports/secret-provider.js';
import {
  isSsoSessionExpiredError,
  SsoSessionExpiredError,
} from '../../domain/sso-session-expired-error.js';
import { describeError } from '../describe-error.js';

const SSM_BATCH_SIZE = 10;

const AUTHENTICATION_ERROR_NAMES = new Set([
  'CredentialsProviderError',
  'UnrecognizedClientException',
  'InvalidClientTokenId',
  'InvalidSignatureException',
  'IncompleteSignatureException',
]);

/**
 * Errors that fail a whole `GetParameters` call because of one of its names,
 * so each name is checked on its own to tell which one.
 */
const PER_NAME_ERROR_NAMES = new Set([
  'AccessDeniedException',
  'ValidationException',
]);

/**
 * {@link ISecretProvider} backed by AWS SSM Parameter Store.
 *
 * Parameters are retrieved with decryption enabled so that
 * SecureString values are returned in plain text.
 *
 * SSM supports fetching up to 10 parameters per request,
 * so names are chunked into batches automatically.
 */
export class AwsSsmSecretProvider
  implements ISecretProvider, ISecretExistenceChecker
{
  private readonly ssmClient: SSMClient;
  private readonly profile?: string;

  constructor(ssmClient: SSMClient, profile?: string) {
    if (!ssmClient) {
      throw new Error('ssmClient cannot be null');
    }
    this.ssmClient = ssmClient;
    this.profile = profile;
  }

  async getSecrets(names: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (names.length === 0) {
      return result;
    }

    for (const name of names) {
      if (!name?.trim()) {
        throw new Error('Secret name cannot be null or whitespace');
      }
    }

    for (let i = 0; i < names.length; i += SSM_BATCH_SIZE) {
      const batch = names.slice(i, i + SSM_BATCH_SIZE);
      try {
        const response = await this.ssmClient.send(
          new GetParametersCommand({
            Names: batch,
            WithDecryption: true,
          }),
        );

        for (const param of response.Parameters ?? []) {
          if (param.Name && param.Value != null) {
            result.set(param.Name, param.Value);
          }
        }
      } catch (error) {
        if (isSsoSessionExpiredError(error)) {
          throw new SsoSessionExpiredError(this.profile, error);
        }
        if (isExpiredCredentialsError(error)) {
          throw new ExpiredCredentialsError(error);
        }
        throw error;
      }
    }

    return result;
  }

  /**
   * Uses `GetParameters` in batches of 10 with `WithDecryption: false`: the
   * names it cannot find come back in `InvalidParameters`, and the values it
   * returns are never read. Needs `ssm:GetParameters` on the parameters.
   */
  async checkSecretsExist(
    names: readonly string[],
  ): Promise<ReadonlyMap<string, SecretExistence>> {
    const results = new Map<string, SecretExistence>();
    const distinct = [...new Set(names)];
    for (let i = 0; i < distinct.length; i += SSM_BATCH_SIZE) {
      const batch = distinct.slice(i, i + SSM_BATCH_SIZE);
      for (const [name, existence] of await this.checkBatch(batch)) {
        results.set(name, existence);
      }
    }
    return results;
  }

  private async checkBatch(
    batch: readonly string[],
  ): Promise<Array<[string, SecretExistence]>> {
    try {
      const { InvalidParameters = [] } = await this.ssmClient.send(
        new GetParametersCommand({
          Names: [...batch],
          WithDecryption: false,
        }),
      );
      const missing = new Set(InvalidParameters);
      return batch.map((name) => [
        name,
        { status: missing.has(name) ? 'missing' : 'exists' },
      ]);
    } catch (error) {
      if (batch.length > 1 && PER_NAME_ERROR_NAMES.has(errorName(error))) {
        const perName = await Promise.all(
          batch.map((name) => this.checkBatch([name])),
        );
        return perName.flat();
      }
      const existence = this.toExistence(error);
      return batch.map((name) => [name, existence]);
    }
  }

  private toExistence(error: unknown): SecretExistence {
    // Expired credentials are a credentials problem: reported, not thrown,
    // with the same remediation a load gives.
    if (isSsoSessionExpiredError(error)) {
      return {
        status: 'authentication_failed',
        reason: new SsoSessionExpiredError(this.profile, error).message,
      };
    }
    if (isExpiredCredentialsError(error)) {
      return {
        status: 'authentication_failed',
        reason: new ExpiredCredentialsError(error).message,
      };
    }
    const name = errorName(error);
    const reason = describeError(error);
    if (name === 'AccessDeniedException') {
      return { status: 'access_denied', reason };
    }
    if (AUTHENTICATION_ERROR_NAMES.has(name)) {
      return { status: 'authentication_failed', reason };
    }
    return { status: 'provider_error', reason };
  }
}

function errorName(error: unknown): string {
  return typeof error === 'object' && error !== null && 'name' in error
    ? String(error.name)
    : '';
}
