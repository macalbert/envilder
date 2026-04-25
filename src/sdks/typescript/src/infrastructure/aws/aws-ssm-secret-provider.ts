import { GetParameterCommand, type SSMClient } from '@aws-sdk/client-ssm';
import type { ISecretProvider } from '../../domain/ports/secret-provider.js';

/**
 * {@link ISecretProvider} backed by AWS SSM Parameter Store.
 *
 * Parameters are retrieved with decryption enabled so that
 * SecureString values are returned in plain text.
 */
export class AwsSsmSecretProvider implements ISecretProvider {
  private readonly ssmClient: SSMClient;

  constructor(ssmClient: SSMClient) {
    if (!ssmClient) {
      throw new Error('ssmClient cannot be null');
    }
    this.ssmClient = ssmClient;
  }

  async getSecret(name: string): Promise<string | null> {
    if (!name?.trim()) {
      throw new Error('Secret name cannot be null or whitespace.');
    }

    try {
      const response = await this.ssmClient.send(
        new GetParameterCommand({
          Name: name,
          WithDecryption: true,
        }),
      );
      return response.Parameter?.Value ?? null;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'ParameterNotFound') {
        return null;
      }
      throw error;
    }
  }
}
