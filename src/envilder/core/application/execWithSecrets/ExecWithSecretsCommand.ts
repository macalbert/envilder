import { OperationMode } from '../../domain/OperationMode.js';

export class ExecWithSecretsCommand {
  readonly mode = OperationMode.EXEC;

  constructor(
    public readonly mapPath: string,
    public readonly command: string,
    public readonly args: readonly string[],
    /**
     * Short description of where secrets come from, shown in the summary
     * line, for example `aws, profile=dev`. Never contains secret values.
     */
    public readonly sourceLabel?: string,
  ) {}

  static create(
    mapPath: string,
    command: string,
    args: readonly string[],
    sourceLabel?: string,
  ): ExecWithSecretsCommand {
    return new ExecWithSecretsCommand(mapPath, command, [...args], sourceLabel);
  }
}
