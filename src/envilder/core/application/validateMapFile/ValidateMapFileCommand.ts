import type { MapFileConfig } from '../../domain/MapFileConfig.js';

export class ValidateMapFileCommand {
  constructor(
    public readonly mapPath: string,
    /** Provider options given as flags; they take precedence over `$config`. */
    public readonly overrides: MapFileConfig,
    /** The providers the caller can resolve secrets from. */
    public readonly supportedProviders: readonly string[],
  ) {}

  static create(
    mapPath: string,
    overrides: MapFileConfig,
    supportedProviders: readonly string[],
  ): ValidateMapFileCommand {
    return new ValidateMapFileCommand(mapPath, { ...overrides }, [
      ...supportedProviders,
    ]);
  }
}
