export interface IEnvFileManager {
  loadParamMap(mapPath: string): Promise<Record<string, string>>;
  loadExistingEnvVariables(
    envFilePath: string,
  ): Promise<Record<string, string>>;
  writeEnvFile(
    envFilePath: string,
    envVariables: Record<string, string>,
  ): Promise<void>;
}
