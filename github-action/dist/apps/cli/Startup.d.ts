import { Container } from 'inversify';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
export declare class Startup {
    private readonly container;
    constructor();
    static build(): Startup;
    configureServices(): this;
    configureInfrastructure(config?: MapFileConfig, allowedVaultHosts?: string[]): this;
    create(): Container;
    getServiceProvider(): Container;
}
//# sourceMappingURL=Startup.d.ts.map