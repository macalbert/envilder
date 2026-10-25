import type { CliOptions } from '../../domain/CliOptions.js';
import type { MapFileTarget } from '../../domain/MapFileUpdate.js';
import { OperationMode } from '../../domain/OperationMode.js';

export class DispatchActionCommand {
  constructor(
    public readonly map?: string,
    public readonly envfile?: string,
    public readonly key?: string,
    public readonly value?: string,
    public readonly secretPath?: string,
    public readonly profile?: string,
    public readonly mode: OperationMode = OperationMode.PULL_SECRETS_TO_ENV,
    /** Exec mode: the program to run. */
    public readonly command?: string,
    /** Exec mode: arguments passed to the program verbatim. */
    public readonly args: readonly string[] = [],
    /** Exec mode: where secrets come from, shown in the summary line. */
    public readonly sourceLabel?: string,
    /** Single-secret push: where the secret goes, for the map file update. */
    public readonly mapTarget?: MapFileTarget,
  ) {}

  /**
   * Builds the command for `envilder exec`: run `command` with the secrets of
   * the map file in its environment.
   */
  static forExec(
    map: string,
    command: string,
    args: readonly string[],
    sourceLabel?: string,
  ): DispatchActionCommand {
    return new DispatchActionCommand(
      map,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.EXEC,
      command,
      [...args],
      sourceLabel,
    );
  }

  static fromCliOptions(options: CliOptions): DispatchActionCommand {
    const mode = DispatchActionCommand.determineOperationMode(options);
    return new DispatchActionCommand(
      options.map,
      options.envfile,
      options.key,
      options.value,
      options.secretPath,
      options.profile,
      mode,
      undefined,
      [],
      undefined,
      options.mapTarget,
    );
  }

  static determineOperationMode(options: CliOptions): OperationMode {
    if (options.key && options.value && options.secretPath) {
      return OperationMode.PUSH_SINGLE;
    }

    if (options.push) {
      return OperationMode.PUSH_ENV_TO_SECRETS;
    }

    return OperationMode.PULL_SECRETS_TO_ENV;
  }
}
