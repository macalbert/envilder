export class PushSingleCommand {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly secretPath: string,
  ) {}

  static create(
    key: string,
    value: string,
    secretPath: string,
  ): PushSingleCommand {
    return new PushSingleCommand(key, value, secretPath);
  }
}
