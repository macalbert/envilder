export interface IVariableStore {
    getMapping(source: string): Promise<Record<string, string>>;
    getEnvironment(source: string): Promise<Record<string, string>>;
    saveEnvironment(destination: string, envVariables: Record<string, string>): Promise<void>;
}
//# sourceMappingURL=IVariableStore.d.ts.map