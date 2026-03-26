import { inject, injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { TYPES } from '../../types.js';
import type { PushSingleCommand } from './PushSingleCommand.js';

@injectable()
export class PushSingleCommandHandler {
  constructor(
    @inject(TYPES.ISecretProvider)
    private readonly secretProvider: ISecretProvider,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
  ) {}

  /**
   * Handles the PushSingleCommand which pushes a single environment variable to the secret store.
   *
   * @param command - The PushSingleCommand containing key, value and secretPath
   */
  async handle(command: PushSingleCommand): Promise<void> {
    try {
      this.logger.info(
        `Starting push operation for key '${command.key}' to path '${EnvironmentVariable.maskSecretPath(command.secretPath)}'`,
      );

      const envVariable = new EnvironmentVariable(
        command.key,
        command.value,
        true,
      );

      await this.secretProvider.setSecret(command.secretPath, command.value);
      this.logger.info(
        `Pushed ${command.key}=${envVariable.maskedValue} to secret store at path ${EnvironmentVariable.maskSecretPath(command.secretPath)}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to push variable to secret store: ${errorMessage}`,
      );
      throw error;
    }
  }
}
