export class PushEnvToSecretsCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
  ) {}

  static create(mapPath: string, envFilePath: string): PushEnvToSecretsCommand {
    return new PushEnvToSecretsCommand(mapPath, envFilePath);
  }
}
