import { DependencyMissingError } from '../../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../../domain/ports/IVariableStore.js';
import { PullSsmToEnvCommandHandler } from '../../pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import { PushEnvToSsmCommandHandler } from '../../pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import { PushSingleCommandHandler } from '../../pushSingle/PushSingleCommandHandler.js';
import { DispatchActionCommandHandler } from '../DispatchActionCommandHandler.js';

export class DispatchActionCommandHandlerBuilder {
  private secretProvider?: ISecretProvider;
  private envFileManager?: IVariableStore;
  private logger?: ILogger;

  static build(): DispatchActionCommandHandlerBuilder {
    return new DispatchActionCommandHandlerBuilder();
  }

  withProvider(provider: ISecretProvider): DispatchActionCommandHandlerBuilder {
    this.secretProvider = provider;
    return this;
  }

  withEnvFileManager(
    fileManager: IVariableStore,
  ): DispatchActionCommandHandlerBuilder {
    this.envFileManager = fileManager;
    return this;
  }

  withLogger(logger: ILogger): DispatchActionCommandHandlerBuilder {
    this.logger = logger;
    return this;
  }

  create(): DispatchActionCommandHandler {
    if (!this.secretProvider) {
      throw new DependencyMissingError('Secret provider is required');
    }

    if (!this.envFileManager) {
      throw new DependencyMissingError('Environment file manager is required');
    }

    if (!this.logger) {
      throw new DependencyMissingError('Logger is required');
    }

    const pullSsmToEnvCommandHandler = new PullSsmToEnvCommandHandler(
      this.secretProvider,
      this.envFileManager,
      this.logger,
    );

    const pushEnvToSsmCommandHandler = new PushEnvToSsmCommandHandler(
      this.secretProvider,
      this.envFileManager,
      this.logger,
    );

    const pushSingleCommandHandler = new PushSingleCommandHandler(
      this.secretProvider,
      this.logger,
    );

    return new DispatchActionCommandHandler(
      pullSsmToEnvCommandHandler,
      pushEnvToSsmCommandHandler,
      pushSingleCommandHandler,
    );
  }
}
