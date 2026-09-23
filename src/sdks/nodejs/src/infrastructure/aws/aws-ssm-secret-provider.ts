import { GetParametersCommand, type SSMClient } from '@aws-sdk/client-ssm';
import {
  ExpiredCredentialsError,
  isExpiredCredentialsError,
} from '../../domain/expired-credentials-error.js';
import type { ISecretProvider } from '../../domain/ports/secret-provider.js';
import {
  isSsoSessionExpiredError,
  SsoSessionExpiredError,
} from '../../domain/sso-session-expired-error.js';

const SSM_BATCH_SIZE = 10;

/**
 * {@link ISecretProvider} backed by AWS SSM Parameter Store.
 *
 * Parameters are retrieved with decryption enabled so that
 * SecureString values are returned in plain text.
 *
 * SSM supports fetching up to 10 parameters per request,
 * so names are chunked into batches automatically.
 */
export class AwsSsmSecretProvider implements ISecretProvider {
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
}
