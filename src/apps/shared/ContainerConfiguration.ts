import type { Container } from 'inversify';

import { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import { PullSecretsToEnvCommandHandler } from '../../envilder/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler.js';
import { PushEnvToSecretsCommandHandler } from '../../envilder/application/pushEnvToSecrets/PushEnvToSecretsCommandHandler.js';
import { PushSingleCommandHandler } from '../../envilder/application/pushSingle/PushSingleCommandHandler.js';
import { InvalidArgumentError } from '../../envilder/domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
import type { ILogger } from '../../envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../envilder/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../envilder/domain/ports/IVariableStore.js';
import { createAwsSecretProvider } from '../../envilder/infrastructure/aws/AwsSecretProviderFactory.js';
import {
  type AzureProviderOptions,
  createAzureSecretProvider,
} from '../../envilder/infrastructure/azure/AzureSecretProviderFactory.js';
import { ConsoleLogger } from '../../envilder/infrastructure/logger/ConsoleLogger.js';
import { FileVariableStore } from '../../envilder/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../envilder/types.js';

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
