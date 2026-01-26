import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import type { PushEnvToSsmCommand } from './PushEnvToSsmCommand.js';
export declare class PushEnvToSsmCommandHandler {
    private readonly secretProvider;
    private readonly variableStore;
    private readonly logger;
    constructor(secretProvider: ISecretProvider, variableStore: IVariableStore, logger: ILogger);
    /**
     * Handles the PushEnvToSsmCommand which imports environment variables
     * from a local file and pushes them to AWS SSM.
     * Uses a map file to determine the SSM parameter path for each environment variable.
     *
     * @param command - The PushEnvToSsmCommand containing mapPath and envFilePath
     */
    handle(command: PushEnvToSsmCommand): Promise<void>;
    private loadConfiguration;
    /**
     * Validates and groups environment variables by SSM path.
     * Ensures that all variables pointing to the same SSM path have the same value.
     * Returns a map of SSM path to value.
     */
    private validateAndGroupByPath;
    private pushParametersToSSM;
    private pushParameter;
    /**
     * Retries an async operation with exponential backoff and jitter.
     * Handles AWS SSM throttling errors (TooManyUpdates).
     */
    private retryWithBackoff;
    private getErrorMessage;
}
//# sourceMappingURL=PushEnvToSsmCommandHandler.d.ts.map