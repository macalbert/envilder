import type { CliOptions } from '../../domain/CliOptions.js';
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
  ) {}

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
    );
  }

  private static determineOperationMode(options: CliOptions): OperationMode {
    if (options.key && options.value && options.secretPath) {
      return OperationMode.PUSH_SINGLE;
    }

    if (options.push) {
      return OperationMode.PUSH_ENV_TO_SECRETS;
    }

    return OperationMode.PULL_SECRETS_TO_ENV;
  }
}
