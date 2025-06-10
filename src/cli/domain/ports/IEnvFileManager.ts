export interface IEnvFileManager {
  loadMapFile(mapPath: string): Promise<Record<string, string>>;
  loadEnvFile(envFilePath: string): Promise<Record<string, string>>;
  saveEnvFile(
    envFilePath: string,
    envVariables: Record<string, string>,
  ): Promise<void>;
}
