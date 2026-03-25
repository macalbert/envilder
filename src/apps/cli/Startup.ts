import { Container } from 'inversify';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
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
