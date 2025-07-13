import type { IEnvFileManager } from '../../domain/ports/IEnvFileManager.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { ImportEnvToSsmCommand } from './ImportEnvToSsmCommand.js';

export class ImportEnvToSsmCommandHandler {
  constructor(
    private readonly keyVault: ISecretProvider,
    private readonly envFileManager: IEnvFileManager,
    private readonly logger: ILogger,
  ) {}

  /**
   * Handles the ImportEnvToSsmCommand which imports environment variables
   * from a local file and pushes them to AWS SSM.
   * Uses a map file to determine the SSM parameter path for each environment variable.
   *
   * @param command - The ImportEnvToSsmCommand containing mapPath and envFilePath
   */
  async handle(command: ImportEnvToSsmCommand): Promise<void> {
    try {
      const paramMap = await this.envFileManager.loadMapFile(command.mapPath);
      const envVariables = await this.envFileManager.loadEnvFile(
        command.envFilePath,
      );

      for (const [envKey, ssmPath] of Object.entries(paramMap)) {
        if (envVariables[envKey]) {
          await this.keyVault.setSecret(ssmPath, envVariables[envKey]);
          this.logger.info(`Pushed ${envKey} to AWS SSM at path ${ssmPath}`);
        } else {
          this.logger.warn(
            `Warning: Environment variable ${envKey} not found in ${command.envFilePath}`,
          );
        }
      }

      this.logger.info(
        `Successfully pushed environment variables from '${command.envFilePath}' to AWS SSM.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to push environment file: ${errorMessage}`);
      throw error;
    }
  }
}
