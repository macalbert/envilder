import type { ParsedMapFile } from '../MapFileConfig.js';
export interface IVariableStore {
    getMapping(source: string): Promise<Record<string, string>>;
    getParsedMapping(source: string): Promise<ParsedMapFile>;
    getEnvironment(source: string): Promise<Record<string, string>>;
    saveEnvironment(destination: string, envVariables: Record<string, string>): Promise<void>;
}
//# sourceMappingURL=IVariableStore.d.ts.map