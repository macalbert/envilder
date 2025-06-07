import type { IEnvFileManager } from '../domain/ports/IEnvFileManager';
import type { ISecretProvider } from '../domain/ports/ISecretProvider';

export class Envilder {
  private keyVault: ISecretProvider;
  private envFileManager: IEnvFileManager;

  constructor(keyVault: ISecretProvider, envFileManager: IEnvFileManager) {
    this.keyVault = keyVault;
    this.envFileManager = envFileManager;
  }

  /**
   * Orchestrates the process of fetching environment variable values from a key vault and writing them to a local environment file.
   *
   * Loads a parameter mapping from a JSON file, retrieves existing environment variables, fetches updated values from the key vault, merges them, and writes the result to the specified environment file.
   *
   * @param mapPath - Path to the JSON file mapping environment variable names to key vault parameter names.
   * @param envFilePath - Path to the local environment file to read and update.
   */
  async run(mapPath: string, envFilePath: string) {
    const paramMap = this.envFileManager.loadParamMap(mapPath);
    const existingEnvVariables =
      this.envFileManager.loadExistingEnvVariables(envFilePath);
    const updatedEnvVariables = await this.fetchAndUpdateEnvVariables(
      paramMap,
      existingEnvVariables,
    );
    this.envFileManager.writeEnvFile(envFilePath, updatedEnvVariables);
    console.log(`Environment File generated at '${envFilePath}'`);
  }

  private async fetchAndUpdateEnvVariables(
    paramMap: Record<string, string>,
    existingEnvVariables: Record<string, string>,
  ): Promise<Record<string, string>> {
    try {
      const errors: string[] = [];
      for (const [envVar, secretName] of Object.entries(paramMap)) {
        try {
          const value = await this.keyVault.getSecret(secretName);
          if (!value) {
            console.error(`Warning: No value found for: '${secretName}'`);
            continue;
          }
          existingEnvVariables[envVar] = value;
          console.log(
            `${envVar}=${value.length > 10 ? '*'.repeat(value.length - 3) + value.slice(-3) : '*'.repeat(value.length)}`,
          );
        } catch (error) {
          console.error(`Error fetching parameter: '${secretName}'`);
          errors.push(`ParameterNotFound: ${secretName}`);
        }
      }
      if (errors.length > 0) {
        throw new Error(
          `Some parameters could not be fetched:\n${errors.join('\n')}`,
        );
      }

      return existingEnvVariables;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed to generate environment file: ${errorMessage}`);
      throw error;
    }
  }
}
