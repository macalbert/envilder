import {
  GetParameterCommand,
  PutParameterCommand,
  type SSM,
} from '@aws-sdk/client-ssm';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider';

export class AwsSsmSecretProvider implements ISecretProvider {
  private ssm: SSM;

  constructor(ssm: SSM) {
    this.ssm = ssm;
  }

  async getSecret(name: string): Promise<string | undefined> {
    try {
      const command = new GetParameterCommand({
        Name: name,
        WithDecryption: true,
      });
      const { Parameter } = await this.ssm.send(command);
      return Parameter?.Value;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'ParameterNotFound'
      ) {
        return undefined;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get secret ${name}: ${errorMessage}`);
    }
  }

  async setSecret(name: string, value: string): Promise<void> {
    const command = new PutParameterCommand({
      Name: name,
      Value: value,
      Type: 'SecureString',
      Overwrite: true,
    });
    await this.ssm.send(command);
  }
}
