import type { PullSsmToEnvCommandHandler } from '../pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import type { PushEnvToSsmCommandHandler } from '../pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import type { PushSingleCommandHandler } from '../pushSingle/PushSingleCommandHandler.js';
import type { DispatchActionCommand } from './DispatchActionCommand.js';
export declare class DispatchActionCommandHandler {
    private readonly pullHandler;
    private readonly pushHandler;
    private readonly pushSingleHandler;
    constructor(pullHandler: PullSsmToEnvCommandHandler, pushHandler: PushEnvToSsmCommandHandler, pushSingleHandler: PushSingleCommandHandler);
    handleCommand(command: DispatchActionCommand): Promise<void>;
    private handlePushSingle;
    private handlePush;
    private handlePull;
    private validateMapAndEnvFileOptions;
}
//# sourceMappingURL=DispatchActionCommandHandler.d.ts.map