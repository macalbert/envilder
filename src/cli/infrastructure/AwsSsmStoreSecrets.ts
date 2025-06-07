import { GetParameterCommand, type SSM } from '@aws-sdk/client-ssm';
import type { ISecretProvider } from '../domain/ports/ISecretProvider';

export class AwsSsmSecretProvider implements ISecretProvider {
  private ssm: SSM;

  constructor(ssm: SSM) {
    this.ssm = ssm;
  }

  async getSecret(name: string): Promise<string | undefined> {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    });
    const { Parameter } = await this.ssm.send(command);
    return Parameter?.Value;
  }
}
