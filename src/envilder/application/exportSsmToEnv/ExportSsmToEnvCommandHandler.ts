import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import type { IEnvFileManager } from '../../domain/ports/IEnvFileManager.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { ExportSsmToEnvCommand } from './ExportSsmToEnvCommand.js';

export class ExportSsmToEnvCommandHandler {
  private static readonly ERROR_MESSAGES = {
    FETCH_FAILED: 'Failed to generate environment file: ',
    PARAM_NOT_FOUND: 'Some parameters could not be fetched:\n',
    NO_VALUE_FOUND: 'Warning: No value found for: ',
    ERROR_FETCHING: 'Error fetching parameter: ',
  };

  private static readonly SUCCESS_MESSAGES = {
    ENV_GENERATED: 'Environment File generated at ',
  };

  constructor(
    private readonly secretProvider: ISecretProvider,
    private readonly envFileManager: IEnvFileManager,
    private readonly logger: ILogger,
  ) {}

  /**
   * Handles the ExportSsmToEnvCommand which orchestrates the process of fetching
   * environment variable values from a key vault and writing them to a local environment file.
   *
   * @param command - The ExportSsmToEnvCommand containing mapPath and envFilePath
   */
  async handle(command: ExportSsmToEnvCommand): Promise<void> {
    try {
      const { requestVariables, currentVariables } =
        await this.loadVariables(command);
      const envilded = await this.envild(requestVariables, currentVariables);
      await this.saveEnvFile(command.envFilePath, envilded);

      this.logger.info(
        `${ExportSsmToEnvCommandHandler.SUCCESS_MESSAGES.ENV_GENERATED}'${command.envFilePath}'`,
      );
    } catch (_error) {
      const errorMessage =
        _error instanceof Error ? _error.message : String(_error);
      this.logger.error(
        `${ExportSsmToEnvCommandHandler.ERROR_MESSAGES.FETCH_FAILED}${errorMessage}`,
      );
      throw _error;
    }
  }

  private async loadVariables(command: ExportSsmToEnvCommand): Promise<{
    requestVariables: Record<string, string>;
    currentVariables: Record<string, string>;
  }> {
    const requestVariables = await this.envFileManager.loadMapFile(
      command.mapPath,
    );
    const currentVariables = await this.envFileManager.loadEnvFile(
      command.envFilePath,
    );

    return { requestVariables, currentVariables };
  }

  private async saveEnvFile(
    envFilePath: string,
    variables: Record<string, string>,
  ): Promise<void> {
    await this.envFileManager.saveEnvFile(envFilePath, variables);
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
        `${ExportSsmToEnvCommandHandler.ERROR_MESSAGES.PARAM_NOT_FOUND}${errors.join('\n')}`,
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
      const value = await this.secretProvider.getSecret(secretName);
      if (!value) {
        this.logger.warn(
          `${ExportSsmToEnvCommandHandler.ERROR_MESSAGES.NO_VALUE_FOUND}'${secretName}'`,
        );
        return null;
      }

      // Store the actual value in the variables collection
      existingEnvVariables[envVar] = value;

      // Create an EnvironmentVariable instance for proper logging
      const envVariable = new EnvironmentVariable(envVar, value, true);
      this.logger.info(`${envVariable.name}=${envVariable.maskedValue}`);

      return null;
    } catch (_error) {
      this.logger.error(
        `${ExportSsmToEnvCommandHandler.ERROR_MESSAGES.ERROR_FETCHING}'${secretName}'`,
      );
      return `ParameterNotFound: ${secretName}`;
    }
  }
}
