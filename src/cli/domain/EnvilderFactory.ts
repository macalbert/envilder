import { SSM } from '@aws-sdk/client-ssm';
import { Envilder } from '../application/EnvilderHandler.js';
import { AwsSsmSecretProvider } from '../infrastructure/AwsSsmStoreSecrets.js';
import type { SSMClientConfig } from '@aws-sdk/client-ssm';
import type { ISecretProvider } from './ports/ISecretProvider.js';
import { fromIni } from '@aws-sdk/credential-providers';

export function createEnvilderWithAwsSsm(profile?: string): Envilder {
  const ssm = profile == null ? new SSM() : new SSM({ credentials: fromIni({ profile: profile }) } as SSMClientConfig);

  const awsSsm = new AwsSsmSecretProvider(ssm);

  return new Envilder(awsSsm);
}

export function createEnvilder(provider: ISecretProvider): Envilder {
  return new Envilder(provider);
}
