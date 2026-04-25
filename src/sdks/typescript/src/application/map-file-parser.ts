import type { MapFileConfig } from '../domain/map-file-config.js';
import type { ParsedMapFile } from '../domain/parsed-map-file.js';
import { SecretProviderType } from '../domain/secret-provider-type.js';

const CONFIG_KEY = '$config';

const PROVIDER_MAP: Record<string, SecretProviderType> = {
  aws: SecretProviderType.Aws,
  azure: SecretProviderType.Azure,
};

/**
 * Parses a JSON map-file string into a {@link ParsedMapFile}.
 */
export class MapFileParser {
  /**
   * Parse a JSON map-file string, extracting `$config` and variable mappings.
   *
   * @param json - Raw JSON string of the map file.
   * @returns Parsed config and variable mappings.
   */
  parse(json: string): ParsedMapFile {
    const raw = JSON.parse(json) as Record<string, unknown>;
    const mappings = new Map<string, string>();
    let config: MapFileConfig = {};

    for (const [key, value] of Object.entries(raw)) {
      if (key === CONFIG_KEY && typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        const providerStr =
          typeof obj.provider === 'string'
            ? obj.provider.toLowerCase()
            : undefined;
        config = {
          provider: providerStr ? PROVIDER_MAP[providerStr] : undefined,
          vaultUrl: typeof obj.vaultUrl === 'string' ? obj.vaultUrl : undefined,
          profile: typeof obj.profile === 'string' ? obj.profile : undefined,
        };
      } else if (typeof value === 'string') {
        mappings.set(key, value);
      }
    }

    return { config, mappings };
  }
}
