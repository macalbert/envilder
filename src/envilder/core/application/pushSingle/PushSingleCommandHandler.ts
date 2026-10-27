import { inject, injectable } from 'inversify';
import pc from 'picocolors';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  EnvironmentFileError,
  InvalidArgumentError,
} from '../../domain/errors/DomainErrors.js';
import {
  decideMapFileUpdate,
  type MapFileTarget,
} from '../../domain/MapFileUpdate.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import type { PushSingleCommand } from './PushSingleCommand.js';

/** A write to the map file, and what it held before so it can be undone. */
type MapFileChange = {
  mapFile: string;
  content: string;
  /** The text the file held before, or `null` when we create it. */
  original: string | null;
};

/** What to do to the map file once the secret is pushed, and what to report. */
type MapFilePlan = {
  /** Absent when the file needs no change. */
  change?: MapFileChange;
  summary?: string;
  warning?: string;
};

/** No map file: nothing to write and nothing to report. */
const NO_MAP_FILE: MapFilePlan = {};

@injectable()
export class PushSingleCommandHandler {
  private static readonly RULE = pc.magenta('\u2501'.repeat(60));

  constructor(
    @inject(TYPES.ISecretProvider)
    private readonly secretProvider: ISecretProvider,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
  ) {}

  /**
   * Handles the PushSingleCommand which pushes a single environment variable to the secret store.
   * When the command names a map file, the mapping is recorded there first and
   * restored if the push fails, so the file never claims a secret that was not pushed.
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

      const envVariable = EnvironmentVariable.secret(
        command.key,
        command.value,
      );

      const plan = await this.planMapFileUpdate(command);
      try {
        await this.writeMapFile(plan);
      } catch (error) {
        // A write that fails midway can leave a truncated file behind.
        await this.rollBackMapFile(plan, command.key);
        throw error;
      }

      try {
        await this.secretProvider.setSecret(command.secretPath, command.value);
      } catch (error) {
        await this.rollBackMapFile(plan, command.key);
        throw error;
      }
      this.logger.info(
        `\n${pc.bold(pc.green('\u2B50 SECRET PUSHED'))}${pc.dim(
          '  \u2014  ',
        )}${pc.bold(command.key)}${pc.dim('=')}${envVariable.maskedValue}${pc.dim(
          ' \u2192 ',
        )}${pc.dim(maskedPath)}\n`,
      );
      this.reportMapFile(plan);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to push variable to secret store: ${errorMessage}`,
      );
      throw error;
    }
  }

  private async planMapFileUpdate(
    command: PushSingleCommand,
  ): Promise<MapFilePlan> {
    const { mapFile, key, secretPath, target } = command;
    if (mapFile === undefined) {
      return NO_MAP_FILE;
    }

    const original = await this.variableStore.readMapFileContent(mapFile);
    const decision = decideMapFileUpdate(
      original,
      key,
      secretPath,
      target,
      mapFile,
    );
    switch (decision.kind) {
      case 'create':
        return {
          change: { mapFile, original, content: decision.content },
          summary: `Created ${mapFile}`,
        };
      case 'append':
        return {
          change: { mapFile, original, content: decision.content },
          summary: `Added ${key} to ${mapFile}`,
        };
      case 'unchanged':
        return {
          summary: `${key} already mapped in ${mapFile}, no changes`,
        };
      case 'targetMismatch':
        return {
          warning:
            `\u26A0 ${mapFile} targets ${this.describeTarget(decision.fileTarget)}, ` +
            `but the secret was pushed to ${this.describeTarget(target)}. ` +
            'The mapping was not added. Use --map=<file> to record it in a different map file.',
        };
      case 'conflict':
        // Names the variable only: the existing path is not ours to echo.
        throw new InvalidArgumentError(
          `${key} is already mapped to a different secret path in ${mapFile}. ` +
            'Nothing was pushed. Update the mapping manually, ' +
            'or use --no-map-update to push without recording it.',
        );
      case 'invalidJson':
        throw new EnvironmentFileError(
          `Invalid JSON in parameter map file: ${mapFile}`,
        );
    }
  }

  private async writeMapFile({ change }: MapFilePlan): Promise<void> {
    if (change === undefined) {
      return;
    }
    await this.variableStore.writeMapFileContent(
      change.mapFile,
      change.content,
    );
  }

  private async rollBackMapFile(
    { change }: MapFilePlan,
    key: string,
  ): Promise<void> {
    if (change === undefined) {
      return;
    }
    try {
      await this.variableStore.restoreMapFile(change.mapFile, change.original);
    } catch {
      this.logger.error(
        `Could not restore ${change.mapFile}. Remove ${key} from it manually.`,
      );
    }
  }

  private reportMapFile({ summary, warning }: MapFilePlan): void {
    if (warning !== undefined) {
      this.logger.warn(pc.yellow(warning));
      return;
    }
    if (summary !== undefined) {
      this.logger.info(`${pc.green('\u2713')} ${summary}\n`);
    }
  }

  /** Provider and vault name only: a vault URL may carry credentials. */
  private describeTarget(target: MapFileTarget): string {
    if (target.provider !== 'azure' || !target.vaultUrl) {
      return target.provider;
    }
    try {
      return `${target.provider} (${new URL(target.vaultUrl).hostname.split('.')[0]})`;
    } catch {
      return target.provider;
    }
  }
}
