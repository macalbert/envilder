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
    try {
      const requestVariables = await this.envFileManager.loadMapFile(mapPath);
      const currentVariables =
        await this.envFileManager.loadEnvFile(envFilePath);

      const envilded = await this.envild(requestVariables, currentVariables);

      await this.envFileManager.saveEnvFile(envFilePath, envilded);

      console.log(`Environment File generated at '${envFilePath}'`);
    } catch (_error) {
      const errorMessage =
        _error instanceof Error ? _error.message : String(_error);
      console.error(`Failed to generate environment file: ${errorMessage}`);
      throw _error;
    }
  }

  private async envild(
    paramMap: Record<string, string>,
    existingEnvVariables: Record<string, string>,
  ): Promise<Record<string, string>> {
    const errors: string[] = [];
    for (const [envVar, secretName] of Object.entries(paramMap)) {
      const error = await this.processSecret(
        envVar,
        secretName,
        existingEnvVariables,
      );
      if (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) {
      throw new Error(
        `Some parameters could not be fetched:\n${errors.join('\n')}`,
      );
    }
    return existingEnvVariables;
  }

  private async processSecret(
    envVar: string,
    secretName: string,
    existingEnvVariables: Record<string, string>,
  ): Promise<string | null> {
    try {
      const value = await this.keyVault.getSecret(secretName);
      if (!value) {
        console.error(`Warning: No value found for: '${secretName}'`);
        return null;
      }
      existingEnvVariables[envVar] = value;
      console.log(
        `${envVar}=${value.length > 10 ? '*'.repeat(value.length - 3) + value.slice(-3) : '*'.repeat(value.length)}`,
      );
      return null;
    } catch (_error) {
      console.error(`Error fetching parameter: '${secretName}'`);
      return `ParameterNotFound: ${secretName}`;
    }
  }
}
