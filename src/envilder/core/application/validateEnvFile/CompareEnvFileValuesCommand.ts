export class CompareEnvFileValuesCommand {
  constructor(
    public readonly mapPath: string,
    public readonly envFilePath: string,
    /** The declared variables to compare, a subset of the map file's. */
    public readonly variables: readonly string[],
  ) {}

  static create(
    mapPath: string,
    envFilePath: string,
    variables: readonly string[],
  ): CompareEnvFileValuesCommand {
    return new CompareEnvFileValuesCommand(mapPath, envFilePath, [
      ...variables,
    ]);
  }
}
