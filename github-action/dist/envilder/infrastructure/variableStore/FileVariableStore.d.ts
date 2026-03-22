import type { MapFileConfig, ParsedMapFile } from '../../domain/MapFileConfig.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
export declare class FileVariableStore implements IVariableStore {
    private logger;
    constructor(logger: ILogger);
    getMapping(source: string): Promise<Record<string, string>>;
    getParsedMapping(source: string): Promise<ParsedMapFile>;
    private readJsonFile;
    getEnvironment(source: string): Promise<Record<string, string>>;
    saveEnvironment(destination: string, envVariables: Record<string, string>): Promise<void>;
    private escapeEnvValue;
}
export declare function readMapFileConfig(mapPath: string): Promise<MapFileConfig>;
//# sourceMappingURL=FileVariableStore.d.ts.map