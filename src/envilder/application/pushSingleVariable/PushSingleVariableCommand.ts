export class PushSingleVariableCommand {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly ssmPath: string,
  ) {}

  static create(
    key: string,
    value: string,
    ssmPath: string,
  ): PushSingleVariableCommand {
    return new PushSingleVariableCommand(key, value, ssmPath);
  }
}
