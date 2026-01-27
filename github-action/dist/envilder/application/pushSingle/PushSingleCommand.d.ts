export declare class PushSingleCommand {
    readonly key: string;
    readonly value: string;
    readonly ssmPath: string;
    constructor(key: string, value: string, ssmPath: string);
    static create(key: string, value: string, ssmPath: string): PushSingleCommand;
}
//# sourceMappingURL=PushSingleCommand.d.ts.map