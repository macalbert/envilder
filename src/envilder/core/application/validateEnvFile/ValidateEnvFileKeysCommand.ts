export class ValidateEnvFileKeysCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
  ) {}

  static create(
    mapPath: string,
    envFilePath: string,
  ): ValidateEnvFileKeysCommand {
    return new ValidateEnvFileKeysCommand(mapPath, envFilePath);
  }
}
