import type { IEnvFileManager } from '../../../domain/ports/IEnvFileManager.js';
import type { ILogger } from '../../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../../domain/ports/ISecretProvider.js';
import { ExportSsmToEnvCommandHandler } from '../../exportSsmToEnv/ExportSsmToEnvCommandHandler.js';
import { ImportEnvToSsmCommandHandler } from '../../importEnvToSsm/ImportEnvToSsmCommandHandler.js';
import { PushSingleVariableCommandHandler } from '../../pushSingleVariable/PushSingleVariableCommandHandler.js';
import { DispatchActionCommandHandler } from '../DispatchActionCommandHandler.js';

export class DispatchActionCommandHandlerBuilder {
  private keyVault?: ISecretProvider;
  private envFileManager?: IEnvFileManager;
  private logger?: ILogger;

  static build(): DispatchActionCommandHandlerBuilder {
    return new DispatchActionCommandHandlerBuilder();
  }

  withProvider(provider: ISecretProvider): DispatchActionCommandHandlerBuilder {
    this.keyVault = provider;
    return this;
  }

  withEnvFileManager(
    fileManager: IEnvFileManager,
  ): DispatchActionCommandHandlerBuilder {
    this.envFileManager = fileManager;
    return this;
  }

  withLogger(logger: ILogger): DispatchActionCommandHandlerBuilder {
    this.logger = logger;
    return this;
  }

  create(): DispatchActionCommandHandler {
    if (!this.keyVault) {
      throw new Error('Provider is required');
    }

    if (!this.envFileManager) {
      throw new Error('EnvFileManager is required');
    }

    if (!this.logger) {
      throw new Error('Logger is required');
    }

    const exportSsmToEnvCommandHandler = new ExportSsmToEnvCommandHandler(
      this.keyVault,
      this.envFileManager,
      this.logger,
    );

    const importEnvToSsmCommandHandler = new ImportEnvToSsmCommandHandler(
      this.keyVault,
      this.envFileManager,
      this.logger,
    );

    const pushSingleVariableCommandHandler =
      new PushSingleVariableCommandHandler(this.keyVault, this.logger);

    return new DispatchActionCommandHandler(
      exportSsmToEnvCommandHandler,
      importEnvToSsmCommandHandler,
      pushSingleVariableCommandHandler,
    );
  }
}
