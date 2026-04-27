import type { MapFileConfig } from './map-file-config.js';

export interface ParsedMapFile {
  readonly config: MapFileConfig;
  readonly mappings: ReadonlyMap<string, string>;
}
