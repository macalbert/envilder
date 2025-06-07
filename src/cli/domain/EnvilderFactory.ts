import { SSM } from '@aws-sdk/client-ssm';
import { Envilder } from '../application/EnvilderHandler.js';
import { AwsSsmStoreSecrets } from '../infrastructure/AwsSsmStoreSecrets.js';
import type { SSMClientConfig } from '@aws-sdk/client-ssm';
import type { IStoreSecrets } from './ports/IStoreSecrets.js';
import { fromIni } from '@aws-sdk/credential-providers';

export function createEnvilder(profile?: string): Envilder {
  const config: SSMClientConfig = { credentials: fromIni({ profile: profile ?? 'default' }) };
  const ssm = new SSM(config);

  const keyVault: IStoreSecrets = new AwsSsmStoreSecrets(ssm);

  return new Envilder(keyVault);
}
