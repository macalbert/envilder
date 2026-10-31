import { Container } from 'inversify';
import type { MapFileConfig } from '../../core/domain/MapFileConfig.js';
import type { ILogger } from '../../core/domain/ports/ILogger.js';
import type { ISecretMasker } from '../../core/domain/ports/ISecretMasker.js';
import { GitHubActionsLogger } from '../../core/infrastructure/github/GitHubActionsLogger.js';
import { GitHubActionsSecretMasker } from '../../core/infrastructure/github/GitHubActionsSecretMasker.js';
import { ConsoleLogger } from '../../core/infrastructure/logger/ConsoleLogger.js';
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

  configureInfrastructure(config?: MapFileConfig): this {
    if (!this.container.isBound(TYPES.ILogger)) {
      this.container
        .bind<ILogger>(TYPES.ILogger)
        .toConstantValue(new GitHubActionsLogger(new ConsoleLogger()));
    }
    if (!this.container.isBound(TYPES.ISecretMasker)) {
      this.container
        .bind<ISecretMasker>(TYPES.ISecretMasker)
        .to(GitHubActionsSecretMasker)
        .inSingletonScope();
    }
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
