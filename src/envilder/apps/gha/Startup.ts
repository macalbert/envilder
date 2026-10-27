import { Container } from 'inversify';
import { ExecWithSecretsCommandHandler } from '../../core/application/execWithSecrets/ExecWithSecretsCommandHandler.js';
import { ExportSecretsToEnvironmentCommandHandler } from '../../core/application/exportSecretsToEnvironment/ExportSecretsToEnvironmentCommandHandler.js';
import type { MapFileConfig } from '../../core/domain/MapFileConfig.js';
import type { IEnvironmentExporter } from '../../core/domain/ports/IEnvironmentExporter.js';
import type { IProcessContext } from '../../core/domain/ports/IProcessContext.js';
import type { IProcessRunner } from '../../core/domain/ports/IProcessRunner.js';
import type { ISecretMasker } from '../../core/domain/ports/ISecretMasker.js';
import { GitHubActionsSecretMasker } from '../../core/infrastructure/github/GitHubActionsSecretMasker.js';
import { GitHubEnvFileExporter } from '../../core/infrastructure/github/GitHubEnvFileExporter.js';
import { CrossSpawnProcessRunner } from '../../core/infrastructure/process/CrossSpawnProcessRunner.js';
import { NodeProcessContext } from '../../core/infrastructure/process/NodeProcessContext.js';
import { TYPES } from '../../core/types.js';
import {
  configureApplicationServices,
  configureInfrastructureServices,
  type InfrastructureOptions,
} from '../shared/ContainerConfiguration.js';

export class Startup {
  private readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  static build(): Startup {
    return new Startup();
  }

  /**
   * Binds the shared handlers plus the two modes only the action offers
   * together: exporting secrets to the job environment (the default) and
   * running a command with them (the `command` input).
   */
  configureServices(): this {
    configureApplicationServices(this.container);
    this.container
      .bind<ExportSecretsToEnvironmentCommandHandler>(
        TYPES.ExportSecretsToEnvironmentCommandHandler,
      )
      .to(ExportSecretsToEnvironmentCommandHandler)
      .inTransientScope();
    this.container
      .bind<ExecWithSecretsCommandHandler>(TYPES.ExecWithSecretsCommandHandler)
      .to(ExecWithSecretsCommandHandler)
      .inTransientScope();
    return this;
  }

  configureInfrastructure(
    config?: MapFileConfig,
    options?: InfrastructureOptions,
  ): this {
    if (!this.container.isBound(TYPES.ISecretMasker)) {
      this.container
        .bind<ISecretMasker>(TYPES.ISecretMasker)
        .to(GitHubActionsSecretMasker)
        .inSingletonScope();
    }
    if (!this.container.isBound(TYPES.IEnvironmentExporter)) {
      this.container
        .bind<IEnvironmentExporter>(TYPES.IEnvironmentExporter)
        .toConstantValue(new GitHubEnvFileExporter());
    }
    if (!this.container.isBound(TYPES.IProcessRunner)) {
      this.container
        .bind<IProcessRunner>(TYPES.IProcessRunner)
        .to(CrossSpawnProcessRunner)
        .inSingletonScope();
    }
    if (!this.container.isBound(TYPES.IProcessContext)) {
      this.container
        .bind<IProcessContext>(TYPES.IProcessContext)
        .to(NodeProcessContext)
        .inSingletonScope();
    }
    configureInfrastructureServices(this.container, config, options);
    return this;
  }

  create(): Container {
    return this.container;
  }

  getServiceProvider(): Container {
    return this.container;
  }
}
