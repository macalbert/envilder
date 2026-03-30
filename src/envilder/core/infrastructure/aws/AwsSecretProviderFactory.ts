import { SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { AwsSsmSecretProvider } from './AwsSsmSecretProvider.js';

export function createAwsSecretProvider(
  config: MapFileConfig,
): ISecretProvider {
  const ssm = config.profile
    ? new SSM({ credentials: fromIni({ profile: config.profile }) })
    : new SSM();
  return new AwsSsmSecretProvider(ssm);
}
