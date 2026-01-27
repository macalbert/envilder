import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { PushSingleCommand } from './PushSingleCommand.js';
export declare class PushSingleCommandHandler {
    private readonly secretProvider;
    private readonly logger;
    constructor(secretProvider: ISecretProvider, logger: ILogger);
    /**
     * Handles the PushSingleCommand which pushes a single environment variable to AWS SSM.
     *
     * @param command - The PushSingleCommand containing key, value and ssmPath
     */
    handle(command: PushSingleCommand): Promise<void>;
}
//# sourceMappingURL=PushSingleCommandHandler.d.ts.map