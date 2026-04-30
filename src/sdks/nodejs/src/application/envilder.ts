import { readFile } from 'node:fs/promises';
import type { EnvilderOptions } from '../domain/envilder-options.js';
import type { SecretProviderType } from '../domain/secret-provider-type.js';
import { createSecretProvider } from '../infrastructure/secret-provider-factory.js';
import { EnvilderClient } from './envilder-client.js';
import { MapFileParser } from './map-file-parser.js';

/**
 * Facade for loading secrets from cloud providers.
 *
 * Supports loading from a single map file or from an
 * environment-based mapping that routes each environment name
 * to its own map file (or `null` to skip).
 *
 * @example
 * ```typescript
 * // One-liner — resolve + inject into process.env:
 * await Envilder.load('secrets-map.json');
 *
 * // Resolve without injecting:
 * const secrets = await Envilder.resolveFile('secrets-map.json');
 *
 * // Fluent builder with provider override:
 * const secrets = await Envilder.fromMapFile('secrets-map.json')
 *   .withProvider(SecretProviderType.Azure)
 *   .withVaultUrl('https://my-vault.vault.azure.net')
 *   .inject();
 * ```
 */
export class Envilder {
  private readonly filePath: string;
  private readonly options: EnvilderOptions = {};

  private constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Returns a fluent builder bound to the given map file.
   *
   * Chain `.withProvider()`, `.withVaultUrl()`, or `.withProfile()`
   * before calling `.resolve()` or `.inject()`.
   */
  static fromMapFile(filePath: string): Envilder {
    validateFilePath(filePath);
    return new Envilder(filePath.trim());
  }

  /**
   * Resolves secrets and injects them into `process.env`.
   *
   * Can be called in two ways:
   * - `load(filePath)` — load from a single map file
   * - `load(env, envMapping)` — look up env in the mapping
   */
  static async load(
    filePathOrEnv: string,
    envMapping?: Record<string, string | null>,
  ): Promise<Map<string, string>> {
    if (envMapping !== undefined) {
      const source = resolveEnvSource(filePathOrEnv, envMapping);
      if (source === null) {
        return new Map();
      }
      return new Envilder(source).inject();
    }

    validateFilePath(filePathOrEnv);
    return new Envilder(filePathOrEnv.trim()).inject();
  }

  /**
   * Resolves secrets without injecting into `process.env`.
   *
   * Can be called in two ways:
   * - `resolveFile(filePath)` — resolve from a single map file
   * - `resolveFile(env, envMapping)` — look up env in the mapping
   */
  static async resolveFile(
    filePathOrEnv: string,
    envMapping?: Record<string, string | null>,
  ): Promise<Map<string, string>> {
    if (envMapping !== undefined) {
      const source = resolveEnvSource(filePathOrEnv, envMapping);
      if (source === null) {
        return new Map();
      }
      return new Envilder(source).resolve();
    }

    validateFilePath(filePathOrEnv);
    return new Envilder(filePathOrEnv.trim()).resolve();
  }

  /** Override the secret provider (AWS or Azure). */
  withProvider(provider: SecretProviderType): Envilder {
    this.options.provider = provider;
    return this;
  }

  /** Override the Azure Key Vault URL. */
  withVaultUrl(vaultUrl: string): Envilder {
    this.options.vaultUrl = vaultUrl;
    return this;
  }

  /** Override the AWS named profile. */
  withProfile(profile: string): Envilder {
    this.options.profile = profile;
    return this;
  }

  /** Resolve secrets and return them as a Map. */
  async resolve(): Promise<Map<string, string>> {
    const mapFile = await this.parseFile();
    const options = this.buildOptions();
    const provider = createSecretProvider(mapFile.config, options);
    const client = new EnvilderClient(provider);
    return client.resolveSecrets(mapFile);
  }

  /** Resolve secrets, inject into `process.env`, and return them. */
  async inject(): Promise<Map<string, string>> {
    const secrets = await this.resolve();
    EnvilderClient.injectIntoEnvironment(secrets);
    return secrets;
  }

  private async parseFile() {
    let json: string;
    try {
      json = await readFile(this.filePath, 'utf-8');
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
        throw new Error(`Map file not found: ${this.filePath}`);
      }
      throw err;
    }
    return new MapFileParser().parse(json);
  }

  private buildOptions(): EnvilderOptions | undefined {
    const hasOverrides =
      this.options.provider !== undefined ||
      this.options.vaultUrl !== undefined ||
      this.options.profile !== undefined;
    return hasOverrides ? this.options : undefined;
  }
}

function validateFilePath(filePath: string): void {
  if (!filePath?.trim()) {
    throw new Error('file path cannot be empty');
  }
}

function resolveEnvSource(
  env: string,
  envMapping: Record<string, string | null>,
): string | null {
  if (!env?.trim()) {
    throw new Error('env cannot be empty');
  }

  const normalized = env.trim();

  if (!Object.hasOwn(envMapping, normalized)) {
    return null;
  }

  const source = envMapping[normalized];

  if (source === null) {
    return null;
  }

  if (!source.trim()) {
    throw new Error(
      `envMapping contains an empty file path for environment '${normalized}'.`,
    );
  }

  return source.trim();
}
