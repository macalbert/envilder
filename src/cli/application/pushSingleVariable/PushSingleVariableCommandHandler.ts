import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { PushSingleVariableCommand } from './PushSingleVariableCommand.js';

export class PushSingleVariableCommandHandler {
  constructor(
    private readonly secretProvider: ISecretProvider,
    private readonly logger: ILogger,
  ) {}

  /**
   * Handles the PushSingleVariableCommand which pushes a single environment variable to AWS SSM.
   *
   * @param command - The PushSingleVariableCommand containing key, value and ssmPath
   */
  async handle(command: PushSingleVariableCommand): Promise<void> {
    try {
      await this.secretProvider.setSecret(command.ssmPath, command.value);
      this.logger.info(
        `Pushed ${command.key} to AWS SSM at path ${command.ssmPath}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to push variable to SSM: ${errorMessage}`);
      throw error;
    }
  }
}
