import { inject, injectable } from 'inversify';
import pc from 'picocolors';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { TYPES } from '../../types.js';
import type { PushSingleCommand } from './PushSingleCommand.js';

@injectable()
export class PushSingleCommandHandler {
  private static readonly RULE = pc.magenta('\u2501'.repeat(60));

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
      const maskedPath = EnvironmentVariable.maskSecretPath(command.secretPath);

      this.logger.info(`\n${pc.bold(pc.magenta('\u{1F4E4} PUSHING SECRET'))}`);
      this.logger.info(PushSingleCommandHandler.RULE);
      this.logger.info(
        `  ${pc.dim('\u2192 ')}${pc.bold(command.key)}${pc.dim(' \u2192 ')}${pc.dim(maskedPath)}`,
      );

      const envVariable = new EnvironmentVariable(
        command.key,
        command.value,
        true,
      );

      await this.secretProvider.setSecret(command.secretPath, command.value);
      this.logger.info(
        `\n${pc.bold(pc.green('\u2B50 SECRET PUSHED'))}${pc.dim(
          '  \u2014  ',
        )}${pc.bold(command.key)}${pc.dim('=')}${envVariable.maskedValue}${pc.dim(
          ' \u2192 ',
        )}${pc.dim(maskedPath)}\n`,
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
