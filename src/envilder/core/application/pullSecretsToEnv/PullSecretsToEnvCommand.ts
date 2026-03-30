export class PullSecretsToEnvCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
  ) {}

  static create(mapPath: string, envFilePath: string): PullSecretsToEnvCommand {
    return new PullSecretsToEnvCommand(mapPath, envFilePath);
  }
}
