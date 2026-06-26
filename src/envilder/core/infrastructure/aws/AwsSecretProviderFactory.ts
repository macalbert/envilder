import { SSM } from '@aws-sdk/client-ssm';
import { STS } from '@aws-sdk/client-sts';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { AwsSsmSecretProvider } from './AwsSsmSecretProvider.js';

export async function resolveRegionWithFallback(): Promise<string> {
  try {
    return await new SSM().config.region();
  } catch {
    return 'us-east-1';
  }
}

export function createAwsSecretProvider(
  config: MapFileConfig,
  logger: ILogger,
): ISecretProvider {
  if (config.profile) {
    process.env.AWS_PROFILE = config.profile;
  }
  const ssm = new SSM({ region: resolveRegionWithFallback });
  const sts = new STS({ region: resolveRegionWithFallback });
  return new AwsSsmSecretProvider(ssm, logger, sts);
}
