import type { SecretClient } from '@azure/keyvault-secrets';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
export declare class AzureKeyVaultSecretProvider implements ISecretProvider {
    private client;
    constructor(client: SecretClient);
    getSecret(name: string): Promise<string | undefined>;
    setSecret(name: string, value: string): Promise<void>;
    private normalizeSecretName;
}
//# sourceMappingURL=AzureKeyVaultSecretProvider.d.ts.map