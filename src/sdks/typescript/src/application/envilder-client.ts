import type { ParsedMapFile } from '../domain/parsed-map-file.js';
import type { ISecretProvider } from '../domain/ports/secret-provider.js';

/**
 * Core client that resolves secrets from a configured provider.
 *
 * For most use cases prefer the {@link Envilder} facade.
 * Use this class directly when you need a custom {@link ISecretProvider}.
 *
 * @example
 * ```typescript
 * const provider = new MyCustomProvider();
 * const mapFile = new MapFileParser().parse(json);
 * const secrets = await new EnvilderClient(provider).resolveSecrets(mapFile);
 * ```
 */
export class EnvilderClient {
  private readonly secretProvider: ISecretProvider;

  constructor(secretProvider: ISecretProvider) {
    if (!secretProvider) {
      throw new Error('secretProvider cannot be null');
    }
    this.secretProvider = secretProvider;
  }

  /**
   * Resolves all mappings against the configured secret provider.
   * Entries whose secret does not exist are silently omitted.
   */
  async resolveSecrets(mapFile: ParsedMapFile): Promise<Map<string, string>> {
    if (mapFile.mappings.size === 0) {
      return new Map();
    }

    const secretPaths = Array.from(mapFile.mappings.values());
    const resolved = await this.secretProvider.getSecrets(secretPaths);

    const result = new Map<string, string>();
    for (const [envVarName, secretPath] of mapFile.mappings) {
      const value = resolved.get(secretPath);
      if (value !== undefined) {
        result.set(envVarName, value);
      }
    }

    return result;
  }

  /**
   * Sets every key/value pair as a process-level environment variable.
   */
  static injectIntoEnvironment(secrets: Map<string, string>): void {
    for (const [key, value] of secrets) {
      process.env[key] = value;
    }
  }
}
