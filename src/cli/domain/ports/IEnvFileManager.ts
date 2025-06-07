export interface IEnvFileManager {
  loadParamMap(mapPath: string): Record<string, string>;
  loadExistingEnvVariables(envFilePath: string): Record<string, string>;
  writeEnvFile(envFilePath: string, envVariables: Record<string, string>): void;
}
