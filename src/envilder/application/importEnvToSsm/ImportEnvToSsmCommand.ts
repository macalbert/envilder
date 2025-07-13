export class ImportEnvToSsmCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
  ) {}

  static create(mapPath: string, envFilePath: string): ImportEnvToSsmCommand {
    return new ImportEnvToSsmCommand(mapPath, envFilePath);
  }
}
