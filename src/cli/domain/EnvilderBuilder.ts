import { SSM } from '@aws-sdk/client-ssm';
import type { SSMClientConfig } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { Envilder } from '../application/EnvilderHandler.js';
import { AwsSsmSecretProvider } from '../infrastructure/AwsSsmStoreSecrets.js';
import type { ISecretProvider } from './ports/ISecretProvider.js';

export class EnvilderBuilder {
  private provider?: ISecretProvider;

  static build(): EnvilderBuilder {
    return new EnvilderBuilder();
  }

  withProvider(provider: ISecretProvider): this {
    this.provider = provider;
    return this;
  }

  withAwsProvider(profile?: string): this {
    const ssm =
      profile == null ? new SSM() : new SSM({ credentials: fromIni({ profile: profile }) } as SSMClientConfig);

    this.provider = new AwsSsmSecretProvider(ssm);
    return this;
  }

  create(): Envilder {
    if (!this.provider) {
      throw new Error('Secret provider must be specified');
    }
    return new Envilder(this.provider);
  }
}
