import type { Container } from 'inversify';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
import { type AzureProviderOptions } from '../../envilder/infrastructure/azure/AzureSecretProviderFactory.js';
export type InfrastructureOptions = AzureProviderOptions;
export declare function configureInfrastructureServices(container: Container, config?: MapFileConfig, options?: InfrastructureOptions): void;
export declare function configureApplicationServices(container: Container): void;
//# sourceMappingURL=ContainerConfiguration.d.ts.map