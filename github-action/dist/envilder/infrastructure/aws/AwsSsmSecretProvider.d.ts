import { type SSM } from '@aws-sdk/client-ssm';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
export declare class AwsSsmSecretProvider implements ISecretProvider {
    private ssm;
    constructor(ssm: SSM);
    getSecret(name: string): Promise<string | undefined>;
    setSecret(name: string, value: string): Promise<void>;
}
//# sourceMappingURL=AwsSsmSecretProvider.d.ts.map