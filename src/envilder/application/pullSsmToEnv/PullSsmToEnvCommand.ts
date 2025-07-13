export class PullSsmToEnvCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
  ) {}

  static create(mapPath: string, envFilePath: string): PullSsmToEnvCommand {
    return new PullSsmToEnvCommand(mapPath, envFilePath);
  }
}
