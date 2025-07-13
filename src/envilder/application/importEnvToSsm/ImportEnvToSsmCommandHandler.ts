import type { IEnvFileManager } from '../../domain/ports/IEnvFileManager.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { ImportEnvToSsmCommand } from './ImportEnvToSsmCommand.js';

export class ImportEnvToSsmCommandHandler {
  constructor(
    private readonly secretProvider: ISecretProvider,
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
      const paramMap = await this.loadConfiguration(command);
      await this.pushVariablesToSSM(paramMap, command);

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

  private async loadConfiguration(command: ImportEnvToSsmCommand): Promise<{
    paramMap: Record<string, string>;
    envVariables: Record<string, string>;
  }> {
    const paramMap = await this.envFileManager.loadMapFile(command.mapPath);
    const envVariables = await this.envFileManager.loadEnvFile(
      command.envFilePath,
    );

    return { paramMap, envVariables };
  }

  private async pushVariablesToSSM(
    config: {
      paramMap: Record<string, string>;
      envVariables: Record<string, string>;
    },
    command: ImportEnvToSsmCommand,
  ): Promise<void> {
    const { paramMap, envVariables } = config;

    // For large parameter sets, consider using controlled parallel processing
    for (const [envKey, ssmPath] of Object.entries(paramMap)) {
      await this.processVariable(
        envKey,
        ssmPath,
        envVariables,
        command.envFilePath,
      );
    }
  }

  private async processVariable(
    envKey: string,
    ssmPath: string,
    envVariables: Record<string, string>,
    envFilePath: string,
  ): Promise<void> {
    if (envVariables[envKey]) {
      await this.secretProvider.setSecret(ssmPath, envVariables[envKey]);
      this.logger.info(`Pushed ${envKey} to AWS SSM at path ${ssmPath}`);
    } else {
      this.logger.warn(
        `Warning: Environment variable ${envKey} not found in ${envFilePath}`,
      );
    }
  }
}
