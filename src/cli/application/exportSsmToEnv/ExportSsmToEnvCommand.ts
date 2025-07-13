export class ExportSsmToEnvCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
  ) {}

  static create(mapPath: string, envFilePath: string): ExportSsmToEnvCommand {
    return new ExportSsmToEnvCommand(mapPath, envFilePath);
  }
}
