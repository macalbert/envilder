import { Container } from 'inversify';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
import { type InfrastructureOptions } from '../shared/ContainerConfiguration.js';
export declare class Startup {
    private readonly container;
    constructor();
    static build(): Startup;
    configureServices(): this;
    configureInfrastructure(config?: MapFileConfig, options?: InfrastructureOptions): this;
    create(): Container;
    getServiceProvider(): Container;
}
//# sourceMappingURL=Startup.d.ts.map