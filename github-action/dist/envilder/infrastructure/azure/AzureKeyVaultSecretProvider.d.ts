import type { SecretClient } from '@azure/keyvault-secrets';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
export declare class AzureKeyVaultSecretProvider implements ISecretProvider {
    private client;
    private normalizedNameRegistry;
    constructor(client: SecretClient);
    getSecret(name: string): Promise<string | undefined>;
    setSecret(name: string, value: string): Promise<void>;
    /**
     * Validates that the secret name meets Azure Key Vault naming constraints.
     * @see https://learn.microsoft.com/en-us/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
     */
    private validateSecretName;
    private resolveSecretName;
    private normalizeSecretName;
}
//# sourceMappingURL=AzureKeyVaultSecretProvider.d.ts.map