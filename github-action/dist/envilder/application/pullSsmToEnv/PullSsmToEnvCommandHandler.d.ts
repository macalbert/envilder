import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import type { PullSsmToEnvCommand } from './PullSsmToEnvCommand.js';
export declare class PullSsmToEnvCommandHandler {
    private readonly secretProvider;
    private readonly variableStore;
    private readonly logger;
    private static readonly ERROR_MESSAGES;
    private static readonly SUCCESS_MESSAGES;
    constructor(secretProvider: ISecretProvider, variableStore: IVariableStore, logger: ILogger);
    /**
     * Handles the PullSsmToEnvCommand which orchestrates the process of fetching
     * environment variable values from a key vault and writing them to a local environment file.
     *
     * @param command - The PullSsmToEnvCommand containing mapPath and envFilePath
     */
    handle(command: PullSsmToEnvCommand): Promise<void>;
    private loadVariables;
    private saveEnvFile;
    private envild;
    private processSecret;
}
//# sourceMappingURL=PullSsmToEnvCommandHandler.d.ts.map