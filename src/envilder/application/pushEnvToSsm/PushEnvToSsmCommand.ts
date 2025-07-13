export class PushEnvToSsmCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
  ) {}

  static create(mapPath: string, envFilePath: string): PushEnvToSsmCommand {
    return new PushEnvToSsmCommand(mapPath, envFilePath);
  }
}
