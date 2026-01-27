import type { CliOptions } from '../../domain/CliOptions.js';
import { OperationMode } from '../../domain/OperationMode.js';
export declare class DispatchActionCommand {
    readonly map?: string | undefined;
    readonly envfile?: string | undefined;
    readonly key?: string | undefined;
    readonly value?: string | undefined;
    readonly ssmPath?: string | undefined;
    readonly profile?: string | undefined;
    readonly mode: OperationMode;
    constructor(map?: string | undefined, envfile?: string | undefined, key?: string | undefined, value?: string | undefined, ssmPath?: string | undefined, profile?: string | undefined, mode?: OperationMode);
    static fromCliOptions(options: CliOptions): DispatchActionCommand;
    private static determineOperationMode;
}
//# sourceMappingURL=DispatchActionCommand.d.ts.map