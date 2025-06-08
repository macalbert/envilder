import type { IEnvFileManager } from '../domain/ports/IEnvFileManager';
import type { ISecretProvider } from '../domain/ports/ISecretProvider';

export class Envilder {
  private keyVault: ISecretProvider;
  private envFileManager: IEnvFileManager;

  constructor(keyVault: ISecretProvider, envFileManager: IEnvFileManager) {
    this.keyVault = keyVault;
    this.envFileManager = envFileManager;
  }

  async run(mapPath: string, envFilePath: string) {
    try {
      const requestVariables = await this.envFileManager.loadMapFile(mapPath);
      const currentVariables =
        await this.envFileManager.loadEnvFile(envFilePath);

      const envilded = await this.envild(requestVariables, currentVariables);

      await this.envFileManager.saveEnvFile(envFilePath, envilded);

      console.log(`Environment File generated at '${envFilePath}'`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed to generate environment file: ${errorMessage}`);
      throw error;
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
    } catch (error) {
      console.error(`Error fetching parameter: '${secretName}'`);
      return `ParameterNotFound: ${secretName}`;
    }
  }
}
