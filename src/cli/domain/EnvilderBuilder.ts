import { SSM } from '@aws-sdk/client-ssm';
import type { SSMClientConfig } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { Envilder } from '../application/EnvilderHandler.js';
import { AwsSsmSecretProvider } from '../infrastructure/AwsSsmSecretProvider.js';
import { EnvFileManager } from '../infrastructure/EnvFileManager.js';
import type { IEnvFileManager } from './ports/IEnvFileManager.js';
import type { ISecretProvider } from './ports/ISecretProvider.js';

export class EnvilderBuilder {
  private provider?: ISecretProvider;
  private fileManager?: IEnvFileManager;

  static build(): EnvilderBuilder {
    return new EnvilderBuilder();
  }

  withDefaultFileManager(): this {
    this.fileManager = new EnvFileManager();
    return this;
  }

  withEnvFileManager(fileManager: IEnvFileManager): this {
    this.fileManager = fileManager;
    return this;
  }

  withProvider(provider: ISecretProvider): this {
    this.provider = provider;
    return this;
  }

  withAwsProvider(profile?: string): this {
    const ssm =
      profile == null
        ? new SSM()
        : new SSM({
            credentials: fromIni({ profile: profile }),
          } as SSMClientConfig);

    this.provider = new AwsSsmSecretProvider(ssm);
    return this;
  }

  create(): Envilder {
    if (!this.provider) {
      throw new Error('Secret provider must be specified');
    }

    if (!this.fileManager) {
      throw new Error('Env file manager must be specified');
    }

    return new Envilder(this.provider, this.fileManager);
  }
}
