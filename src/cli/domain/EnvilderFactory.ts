import { SSM } from '@aws-sdk/client-ssm';
import { Envilder } from '../application/EnvilderHandler.js';
import { AwsSsmStoreSecrets } from '../infrastructure/AwsSsmStoreSecrets.js';
import type { SSMClientConfig } from '@aws-sdk/client-ssm';
import type { IStoreSecrets } from './ports/IStoreSecrets.js';
import { fromIni } from '@aws-sdk/credential-providers';

export function createEnvilderWithAwsSsm(profile?: string): Envilder {
  const ssm = profile == null ? new SSM() : new SSM({ credentials: fromIni({ profile: profile }) } as SSMClientConfig);

  const keyVault: IStoreSecrets = new AwsSsmStoreSecrets(ssm);

  return new Envilder(keyVault);
}
