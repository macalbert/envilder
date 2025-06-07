import { GetParameterCommand, type SSM } from '@aws-sdk/client-ssm';
import type { IStoreSecrets } from '../domain/ports/IStoreSecrets';

export class AwsSsmStoreSecrets implements IStoreSecrets {
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
