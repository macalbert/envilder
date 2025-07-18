import { Container } from 'inversify';
import { DispatchActionCommandHandler } from '../../application/dispatch/DispatchActionCommandHandler.js';
// Application Services
import { PullSsmToEnvCommandHandler } from '../../application/pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommandHandler } from '../../application/pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleCommandHandler } from '../../application/pushSingle/PushSingleCommandHandler.js';
// Domain Ports
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
// Infrastructure Implementations
import { ConsoleLogger } from '../logger/ConsoleLogger.js';
import { FileVariableStore } from '../variableStore/FileConfigurationRepository.js';
import { TYPES } from './types.js';

export function createContainer(): Container {
  const container = new Container();

  // Bind domain ports to implementations
  container.bind<ILogger>(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
  container
    .bind<IVariableStore>(TYPES.IVariableStore)
    .to(FileVariableStore)
    .inSingletonScope();

  // Note: ISecretProvider (AwsSsmSecretProvider) will be bound at runtime with SSM client

  // Bind application services
  container
    .bind<PullSsmToEnvCommandHandler>(TYPES.PullSsmToEnvCommandHandler)
    .to(PullSsmToEnvCommandHandler);
  container
    .bind<PushEnvToSsmCommandHandler>(TYPES.PushEnvToSsmCommandHandler)
    .to(PushEnvToSsmCommandHandler);
  container
    .bind<PushSingleCommandHandler>(TYPES.PushSingleCommandHandler)
    .to(PushSingleCommandHandler);
  container
    .bind<DispatchActionCommandHandler>(TYPES.DispatchActionCommandHandler)
    .to(DispatchActionCommandHandler);

  return container;
}

export function bindSecretProvider(
  container: Container,
  secretProvider: ISecretProvider,
): void {
  container
    .bind<ISecretProvider>(TYPES.ISecretProvider)
    .toConstantValue(secretProvider);
}
