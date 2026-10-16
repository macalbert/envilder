import { Container } from 'inversify';
import { ExecWithSecretsCommandHandler } from '../../core/application/execWithSecrets/ExecWithSecretsCommandHandler.js';
import type { MapFileConfig } from '../../core/domain/MapFileConfig.js';
import type { ILogger } from '../../core/domain/ports/ILogger.js';
import type { IProcessContext } from '../../core/domain/ports/IProcessContext.js';
import type { IProcessRunner } from '../../core/domain/ports/IProcessRunner.js';
import type { ISecretMasker } from '../../core/domain/ports/ISecretMasker.js';
import { GitHubActionsSecretMasker } from '../../core/infrastructure/github/GitHubActionsSecretMasker.js';
import { NoOpSecretMasker } from '../../core/infrastructure/github/NoOpSecretMasker.js';
import { StderrConsoleLogger } from '../../core/infrastructure/logger/StderrConsoleLogger.js';
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

  configureServices(): this {
    configureApplicationServices(this.container);
    return this;
  }

  /**
   * Wires the services specific to `envilder exec`: its handler, a logger that keeps
   * stdout free for the child, the process runner, and the GitHub Actions
   * secret masker when running inside a workflow. Call it before
   * `configureInfrastructure`, which only binds the defaults left unbound.
   */
  configureExec(options: { githubActions: boolean }): this {
    this.container
      .bind<ILogger>(TYPES.ILogger)
      .to(StderrConsoleLogger)
      .inSingletonScope();
    // Exec writes mask registrations to stderr: the runner reads workflow
    // commands from both streams, and stdout belongs to the child.
    this.container
      .bind<ISecretMasker>(TYPES.ISecretMasker)
      .toConstantValue(
        options.githubActions
          ? new GitHubActionsSecretMasker({ stream: process.stderr })
          : new NoOpSecretMasker(),
      );
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

  configureInfrastructure(
    config?: MapFileConfig,
    options?: InfrastructureOptions,
  ): this {
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
