import { SSM } from '@aws-sdk/client-ssm';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { AwsSsmSecretProvider } from './AwsSsmSecretProvider.js';

export function createAwsSecretProvider(
  config: MapFileConfig,
): ISecretProvider {
  const profile = config.profile?.trim();
  const ssm = profile
    ? new SSM({ credentials: fromNodeProviderChain({ profile }) })
    : new SSM();
  return new AwsSsmSecretProvider(ssm);
}
