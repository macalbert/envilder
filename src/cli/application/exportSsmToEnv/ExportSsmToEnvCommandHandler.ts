import type { IEnvFileManager } from '../../domain/ports/IEnvFileManager.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { ExportSsmToEnvCommand } from './ExportSsmToEnvCommand.js';

export class ExportSsmToEnvCommandHandler {
  constructor(
    private readonly keyVault: ISecretProvider,
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
      const requestVariables = await this.envFileManager.loadMapFile(
        command.mapPath,
      );
      const currentVariables = await this.envFileManager.loadEnvFile(
        command.envFilePath,
      );

      const envilded = await this.envild(requestVariables, currentVariables);

      await this.envFileManager.saveEnvFile(command.envFilePath, envilded);

      this.logger.info(
        `Environment File generated at '${command.envFilePath}'`,
      );
    } catch (_error) {
      const errorMessage =
        _error instanceof Error ? _error.message : String(_error);
      this.logger.error(`Failed to generate environment file: ${errorMessage}`);
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
        this.logger.warn(`Warning: No value found for: '${secretName}'`);
        return null;
      }
      existingEnvVariables[envVar] = value;
      this.logger.info(
        `${envVar}=${value.length > 10 ? '*'.repeat(value.length - 3) + value.slice(-3) : '*'.repeat(value.length)}`,
      );
      return null;
    } catch (_error) {
      this.logger.error(`Error fetching parameter: '${secretName}'`);
      return `ParameterNotFound: ${secretName}`;
    }
  }
}
