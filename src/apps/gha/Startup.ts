import { Container } from 'inversify';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
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

  configureInfrastructure(
    config?: MapFileConfig,
    additionalVaultHosts?: string[],
  ): this {
    configureInfrastructureServices(
      this.container,
      config,
      additionalVaultHosts,
    );
    return this;
  }

  create(): Container {
    return this.container;
  }

  getServiceProvider(): Container {
    return this.container;
  }
}
