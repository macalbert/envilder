export class PushSingleCommand {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly ssmPath: string,
  ) {}

  static create(
    key: string,
    value: string,
    ssmPath: string,
  ): PushSingleCommand {
    return new PushSingleCommand(key, value, ssmPath);
  }
}
