import { Container } from 'inversify';
import type { MapFileConfig } from '../../core/domain/MapFileConfig.js';
import type { ISecretMasker } from '../../core/domain/ports/ISecretMasker.js';
import { GitHubActionsSecretMasker } from '../../core/infrastructure/github/GitHubActionsSecretMasker.js';
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
