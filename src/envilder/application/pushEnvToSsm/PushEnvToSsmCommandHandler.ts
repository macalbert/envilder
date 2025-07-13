import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import type { IEnvFileManager } from '../../domain/ports/IEnvFileManager.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { PushEnvToSsmCommand } from './PushEnvToSsmCommand.js';

export class PushEnvToSsmCommandHandler {
  constructor(
    private readonly secretProvider: ISecretProvider,
    private readonly envFileManager: IEnvFileManager,
    private readonly logger: ILogger,
  ) {}

  /**
   * Handles the PushEnvToSsmCommand which imports environment variables
   * from a local file and pushes them to AWS SSM.
   * Uses a map file to determine the SSM parameter path for each environment variable.
   *
   * @param command - The PushEnvToSsmCommand containing mapPath and envFilePath
   */
  async handle(command: PushEnvToSsmCommand): Promise<void> {
    try {
      this.logger.info(
        `Starting push operation from '${command.envFilePath}' using map '${command.mapPath}'`,
      );
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

  private async loadConfiguration(command: PushEnvToSsmCommand): Promise<{
    paramMap: Record<string, string>;
    envVariables: Record<string, string>;
  }> {
    this.logger.info(`Loading parameter map from '${command.mapPath}'`);
    const paramMap = await this.envFileManager.loadMapFile(command.mapPath);

    this.logger.info(
      `Loading environment variables from '${command.envFilePath}'`,
    );
    const envVariables = await this.envFileManager.loadEnvFile(
      command.envFilePath,
    );

    // Log the number of variables found in each file
    this.logger.info(
      `Found ${Object.keys(paramMap).length} parameter mappings in map file`,
    );
    this.logger.info(
      `Found ${Object.keys(envVariables).length} environment variables in env file`,
    );

    return { paramMap, envVariables };
  }

  private async pushVariablesToSSM(
    config: {
      paramMap: Record<string, string>;
      envVariables: Record<string, string>;
    },
    command: PushEnvToSsmCommand,
  ): Promise<void> {
    const { paramMap, envVariables } = config;

    // Log the keys that are about to be processed
    const keysToProcess = Object.keys(paramMap);
    this.logger.info(
      `Processing ${keysToProcess.length} environment variables to push to AWS SSM`,
    );

    const variableProcessingPromises = Object.entries(paramMap).map(
      ([envKey, ssmPath]) => {
        return this.processVariable(
          envKey,
          ssmPath,
          envVariables,
          command.envFilePath,
        );
      },
    );

    await Promise.all(variableProcessingPromises);
  }

  private async processVariable(
    envKey: string,
    ssmPath: string,
    envVariables: Record<string, string>,
    envFilePath: string,
  ): Promise<void> {
    if (Object.hasOwn(envVariables, envKey)) {
      const envVariable = new EnvironmentVariable(
        envKey,
        envVariables[envKey],
        true,
      );

      await this.secretProvider.setSecret(ssmPath, envVariables[envKey]);
      this.logger.info(
        `Pushed ${envKey}=${envVariable.maskedValue} to AWS SSM at path ${ssmPath}`,
      );
    } else {
      this.logger.warn(
        `Warning: Environment variable ${envKey} not found in ${envFilePath}`,
      );
    }
  }
}
