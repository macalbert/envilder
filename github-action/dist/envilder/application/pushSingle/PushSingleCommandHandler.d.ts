import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { PushSingleCommand } from './PushSingleCommand.js';
export declare class PushSingleCommandHandler {
    private readonly secretProvider;
    private readonly logger;
    constructor(secretProvider: ISecretProvider, logger: ILogger);
    /**
     * Handles the PushSingleCommand which pushes a single environment variable to the secret store.
     *
     * @param command - The PushSingleCommand containing key, value and secretPath
     */
    handle(command: PushSingleCommand): Promise<void>;
}
//# sourceMappingURL=PushSingleCommandHandler.d.ts.map