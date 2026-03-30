import type { Container } from 'inversify';

import { DispatchActionCommandHandler } from '../../core/application/dispatch/DispatchActionCommandHandler.js';
import { PullSecretsToEnvCommandHandler } from '../../core/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler.js';
import { PushEnvToSecretsCommandHandler } from '../../core/application/pushEnvToSecrets/PushEnvToSecretsCommandHandler.js';
import { PushSingleCommandHandler } from '../../core/application/pushSingle/PushSingleCommandHandler.js';
import { InvalidArgumentError } from '../../core/domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../core/domain/MapFileConfig.js';
import type { ILogger } from '../../core/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../core/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../core/domain/ports/IVariableStore.js';
import { createAwsSecretProvider } from '../../core/infrastructure/aws/AwsSecretProviderFactory.js';
import {
  type AzureProviderOptions,
  createAzureSecretProvider,
} from '../../core/infrastructure/azure/AzureSecretProviderFactory.js';
import { ConsoleLogger } from '../../core/infrastructure/logger/ConsoleLogger.js';
import { FileVariableStore } from '../../core/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../core/types.js';

export type InfrastructureOptions = AzureProviderOptions;

type ProviderFactory = (
  config: MapFileConfig,
  options: InfrastructureOptions,
) => ISecretProvider;

const providerFactories: Record<string, ProviderFactory> = {
  aws: (config) => createAwsSecretProvider(config),
  azure: (config, options) => createAzureSecretProvider(config, options),
};

export function configureInfrastructureServices(
  container: Container,
  config: MapFileConfig = {},
  options: InfrastructureOptions = {},
): void {
  if (!container.isBound(TYPES.ILogger)) {
    container.bind<ILogger>(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
  }

  if (!container.isBound(TYPES.IVariableStore)) {
    container
      .bind<IVariableStore>(TYPES.IVariableStore)
      .to(FileVariableStore)
      .inSingletonScope();
  }

  const selectedProvider = config.provider?.toLowerCase() || 'aws';

  if (config.profile && selectedProvider !== 'aws') {
    const logger = container.get<ILogger>(TYPES.ILogger);
    logger.warn(
      `--profile is only supported with the aws provider` +
        ` and will be ignored` +
        ` (current provider: ${selectedProvider}).`,
    );
  }

  const factory = providerFactories[selectedProvider];
  if (!factory) {
    throw new InvalidArgumentError(
      `Unsupported provider: ${config.provider}.` +
        ` Supported providers:` +
        ` ${Object.keys(providerFactories).join(', ')}`,
    );
  }
  const secretProvider = factory(config, options);

  container
    .bind<ISecretProvider>(TYPES.ISecretProvider)
    .toConstantValue(secretProvider);
}

export function configureApplicationServices(container: Container): void {
  container
    .bind<PullSecretsToEnvCommandHandler>(TYPES.PullSecretsToEnvCommandHandler)
    .to(PullSecretsToEnvCommandHandler)
    .inTransientScope();

  container
    .bind<PushEnvToSecretsCommandHandler>(TYPES.PushEnvToSecretsCommandHandler)
    .to(PushEnvToSecretsCommandHandler)
    .inTransientScope();

  container
    .bind<PushSingleCommandHandler>(TYPES.PushSingleCommandHandler)
    .to(PushSingleCommandHandler)
    .inTransientScope();

  container
    .bind<DispatchActionCommandHandler>(TYPES.DispatchActionCommandHandler)
    .to(DispatchActionCommandHandler)
    .inTransientScope();
}
