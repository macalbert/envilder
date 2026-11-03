import { Container } from 'inversify';
import { ExecWithSecretsCommandHandler } from '../../core/application/execWithSecrets/ExecWithSecretsCommandHandler.js';
import { CompareEnvFileValuesCommandHandler } from '../../core/application/validateEnvFile/CompareEnvFileValuesCommandHandler.js';
import { ValidateEnvFileKeysCommandHandler } from '../../core/application/validateEnvFile/ValidateEnvFileKeysCommandHandler.js';
import { ValidateMapFileCommandHandler } from '../../core/application/validateMapFile/ValidateMapFileCommandHandler.js';
import { ValidateRemoteKeysCommandHandler } from '../../core/application/validateRemoteKeys/ValidateRemoteKeysCommandHandler.js';
import type { MapFileConfig } from '../../core/domain/MapFileConfig.js';
import type { ILogger } from '../../core/domain/ports/ILogger.js';
import type { IProcessContext } from '../../core/domain/ports/IProcessContext.js';
import type { IProcessRunner } from '../../core/domain/ports/IProcessRunner.js';
import type { ISecretMasker } from '../../core/domain/ports/ISecretMasker.js';
import type { IVariableStore } from '../../core/domain/ports/IVariableStore.js';
import { ConsoleLogger } from '../../core/infrastructure/logger/ConsoleLogger.js';
import { CrossSpawnProcessRunner } from '../../core/infrastructure/process/CrossSpawnProcessRunner.js';
import { NodeProcessContext } from '../../core/infrastructure/process/NodeProcessContext.js';
import { FileVariableStore } from '../../core/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../core/types.js';
import {
  configureApplicationServices,
  configureInfrastructureServices,
} from '../shared/ContainerConfiguration.js';

export class Startup {
  private readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  static build(): Startup {
    return new Startup();
  }

  configureServices(): this {
    configureApplicationServices(this.container);
    return this;
  }

  /**
   * Wires the services specific to `envilder exec`: its handler, the process
   * runner, and the given logger and secret masker. The logger must keep
   * stdout free for the child. Call it before `configureInfrastructure`,
   * which only binds the defaults left unbound.
   */
  configureExec(secretMasker: ISecretMasker, logger: ILogger): this {
    this.container.bind<ILogger>(TYPES.ILogger).toConstantValue(logger);
    this.container
      .bind<ISecretMasker>(TYPES.ISecretMasker)
      .toConstantValue(secretMasker);
    this.container
      .bind<IProcessRunner>(TYPES.IProcessRunner)
      .to(CrossSpawnProcessRunner)
      .inSingletonScope();
    this.container
      .bind<IProcessContext>(TYPES.IProcessContext)
      .to(NodeProcessContext)
      .inSingletonScope();
    this.container
      .bind<ExecWithSecretsCommandHandler>(TYPES.ExecWithSecretsCommandHandler)
      .to(ExecWithSecretsCommandHandler)
      .inTransientScope();
    return this;
  }

  /**
   * Wires the local part of `envilder validate`: the map file and the env
   * file keys are read and checked locally, so no secret provider is bound.
   * Use it instead of `configureServices` and `configureInfrastructure`.
   */
  configureOfflineValidation(): this {
    this.container
      .bind<ILogger>(TYPES.ILogger)
      .to(ConsoleLogger)
      .inSingletonScope();
    this.container
      .bind<IVariableStore>(TYPES.IVariableStore)
      .to(FileVariableStore)
      .inSingletonScope();
    this.container
      .bind<ValidateMapFileCommandHandler>(TYPES.ValidateMapFileCommandHandler)
      .to(ValidateMapFileCommandHandler)
      .inTransientScope();
    this.container
      .bind<ValidateEnvFileKeysCommandHandler>(
        TYPES.ValidateEnvFileKeysCommandHandler,
      )
      .to(ValidateEnvFileKeysCommandHandler)
      .inTransientScope();
    return this;
  }

  /**
   * Wires the remote part of `envilder validate`, which checks that each
   * declared secret exists and, with `--compare-values`, compares remote
   * values with the env file. Call `configureInfrastructure` afterwards to bind
   * the secret provider, the logger and the variable store.
   */
  configureRemoteValidation(): this {
    this.container
      .bind<ValidateRemoteKeysCommandHandler>(
        TYPES.ValidateRemoteKeysCommandHandler,
      )
      .to(ValidateRemoteKeysCommandHandler)
      .inTransientScope();
    this.container
      .bind<CompareEnvFileValuesCommandHandler>(
        TYPES.CompareEnvFileValuesCommandHandler,
      )
      .to(CompareEnvFileValuesCommandHandler)
      .inTransientScope();
    return this;
  }

  configureInfrastructure(config?: MapFileConfig): this {
    configureInfrastructureServices(this.container, config);
    return this;
  }

  create(): Container {
    return this.container;
  }

  getServiceProvider(): Container {
    return this.container;
  }
}
