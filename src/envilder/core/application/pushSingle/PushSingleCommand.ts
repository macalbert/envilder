import type { MapFileTarget } from '../../domain/MapFileUpdate.js';

export class PushSingleCommand {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly secretPath: string,
    /** Map file to record the mapping in; undefined leaves map files alone. */
    public readonly mapFile?: string,
    /** Where the secret is pushed to, compared with the map file's target. */
    public readonly target: MapFileTarget = { provider: 'aws' },
  ) {}

  static create(
    key: string,
    value: string,
    secretPath: string,
    mapFile?: string,
    target?: MapFileTarget,
  ): PushSingleCommand {
    return new PushSingleCommand(key, value, secretPath, mapFile, target);
  }
}
