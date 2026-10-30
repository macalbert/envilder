import type { Container } from 'inversify';

import { DispatchActionCommandHandler } from '../../core/application/dispatch/DispatchActionCommandHandler.js';
import { PullSecretsToEnvCommandHandler } from '../../core/application/pullSecretsToEnv/PullSecretsToEnvCommandHandler.js';
import { PushEnvToSecretsCommandHandler } from '../../core/application/pushEnvToSecrets/PushEnvToSecretsCommandHandler.js';
import { PushSingleCommandHandler } from '../../core/application/pushSingle/PushSingleCommandHandler.js';
import { InvalidArgumentError } from '../../core/domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../core/domain/MapFileConfig.js';
import {
  DEFAULT_PROVIDER,
  unsupportedProviderMessage,
} from '../../core/domain/ProviderConfiguration.js';
import type { ILogger } from '../../core/domain/ports/ILogger.js';
import type { ISecretMasker } from '../../core/domain/ports/ISecretMasker.js';
import type { ISecretProvider } from '../../core/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../core/domain/ports/IVariableStore.js';
import { createAwsSecretProvider } from '../../core/infrastructure/aws/AwsSecretProviderFactory.js';
import { createAzureSecretProvider } from '../../core/infrastructure/azure/AzureSecretProviderFactory.js';
import { NoOpSecretMasker } from '../../core/infrastructure/github/NoOpSecretMasker.js';
import { ConsoleLogger } from '../../core/infrastructure/logger/ConsoleLogger.js';
import { FileVariableStore } from '../../core/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../core/types.js';

type ProviderFactory = (
  config: MapFileConfig,
  logger: ILogger,
) => ISecretProvider;

const providerFactories: Record<string, ProviderFactory> = {
  aws: (config, logger) => createAwsSecretProvider(config, logger),
  azure: (config) => createAzureSecretProvider(config),
};

/** The providers the CLI and the GitHub Action can resolve secrets from. */
export const SUPPORTED_PROVIDERS: readonly string[] =
  Object.keys(providerFactories);

export function configureInfrastructureServices(
  container: Container,
  config: MapFileConfig = {},
): void {
  if (!container.isBound(TYPES.ILogger)) {
    container.bind<ILogger>(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
  }

  const logger = container.get<ILogger>(TYPES.ILogger);

  if (!container.isBound(TYPES.IVariableStore)) {
    container
      .bind<IVariableStore>(TYPES.IVariableStore)
      .to(FileVariableStore)
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.ISecretMasker)) {
    container
      .bind<ISecretMasker>(TYPES.ISecretMasker)
      .to(NoOpSecretMasker)
      .inSingletonScope();
  }

  const selectedProvider = config.provider?.toLowerCase() || DEFAULT_PROVIDER;

  if (config.profile && selectedProvider !== 'aws') {
    logger.warn(
      `--profile is only supported with the aws provider` +
        ` and will be ignored` +
        ` (current provider: ${selectedProvider}).`,
    );
  }

  const factory = providerFactories[selectedProvider];
  if (!factory) {
    throw new InvalidArgumentError(
      unsupportedProviderMessage(`${config.provider}`, SUPPORTED_PROVIDERS),
    );
  }
  const secretProvider = factory(config, logger);

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
