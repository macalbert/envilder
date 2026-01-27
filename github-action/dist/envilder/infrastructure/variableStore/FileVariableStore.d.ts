import type { ILogger } from '../../domain/ports/ILogger.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
export declare class FileVariableStore implements IVariableStore {
    private logger;
    constructor(logger: ILogger);
    getMapping(source: string): Promise<Record<string, string>>;
    getEnvironment(source: string): Promise<Record<string, string>>;
    saveEnvironment(destination: string, envVariables: Record<string, string>): Promise<void>;
    private escapeEnvValue;
}
//# sourceMappingURL=FileVariableStore.d.ts.map