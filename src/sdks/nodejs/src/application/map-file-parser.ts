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
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      throw new Error('Invalid map file: content is not valid JSON');
    }
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error('Invalid map file: root must be a JSON object');
    }
    const mappings = new Map<string, string>();
    let config: MapFileConfig = {};

    for (const [key, value] of Object.entries(raw)) {
      if (key === CONFIG_KEY) {
        if (typeof value === 'object' && value !== null) {
          const obj = value as Record<string, unknown>;
          const providerStr =
            typeof obj.provider === 'string'
              ? obj.provider.toLowerCase()
              : undefined;
          config = {
            provider: providerStr ? PROVIDER_MAP[providerStr] : undefined,
            vaultUrl:
              typeof obj.vaultUrl === 'string' ? obj.vaultUrl : undefined,
            profile: typeof obj.profile === 'string' ? obj.profile : undefined,
          };

          if (providerStr && !config.provider) {
            throw new Error(
              `Unknown provider: '${obj.provider}'. Supported: aws, azure`,
            );
          }
        }
        continue;
      }

      if (typeof value === 'string') {
        mappings.set(key, value);
      }
    }

    return { config, mappings };
  }
}
