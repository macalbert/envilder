import type { Container } from 'inversify';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
/**
 * Options that only test or infrastructure code should set.
 * Not exposed via CLI flags or map-file $config.
 */
export type InfrastructureOptions = {
    /** Override the default Azure vault host allowlist (for test doubles). */
    allowedVaultHosts?: string[];
    /**
     * Disable Azure SDK challenge-resource verification.
     * Only for local test doubles (e.g. Lowkey Vault).
     * Weakens SSRF protection — never enable in production.
     */
    disableChallengeResourceVerification?: boolean;
};
export declare function configureInfrastructureServices(container: Container, config?: MapFileConfig, options?: InfrastructureOptions): void;
export declare function configureApplicationServices(container: Container): void;
//# sourceMappingURL=ContainerConfiguration.d.ts.map