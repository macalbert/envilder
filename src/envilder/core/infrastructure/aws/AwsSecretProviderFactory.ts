import { SSM } from '@aws-sdk/client-ssm';
import { STS } from '@aws-sdk/client-sts';
import type { MapFileConfig } from '../../domain/MapFileConfig.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { AwsSsmSecretProvider } from './AwsSsmSecretProvider.js';

export async function resolveRegionWithFallback(
  profile?: string,
): Promise<string> {
  if (process.env.AWS_REGION) {
    return process.env.AWS_REGION;
  }
  if (process.env.AWS_DEFAULT_REGION) {
    return process.env.AWS_DEFAULT_REGION;
  }
  try {
    return await new SSM(profile ? { profile } : {}).config.region();
  } catch {
    return 'us-east-1';
  }
}

export function createAwsSecretProvider(
  config: MapFileConfig,
  logger: ILogger,
): ISecretProvider {
  const { profile } = config;
  const region = () => resolveRegionWithFallback(profile);
  const clientConfig = profile ? { profile, region } : { region };
  const ssm = new SSM(clientConfig);
  const sts = new STS({
    ...clientConfig,
    maxAttempts: 1,
    requestHandler: { requestTimeout: 2000 },
  });
  return new AwsSsmSecretProvider(ssm, logger, sts, profile);
}
