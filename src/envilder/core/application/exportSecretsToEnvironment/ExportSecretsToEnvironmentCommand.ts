export class ExportSecretsToEnvironmentCommand {
  constructor(public readonly mapPath: string) {}

  static create(mapPath: string): ExportSecretsToEnvironmentCommand {
    return new ExportSecretsToEnvironmentCommand(mapPath);
  }
}
