import { readFile } from 'node:fs/promises';
import type { ContractValidationResult } from '../domain/contract-validation-result.js';
import type { EnvilderOptions } from '../domain/envilder-options.js';
import type { ParsedMapFile } from '../domain/parsed-map-file.js';
import type { ISecretProvider } from '../domain/ports/secret-provider.js';
import { SecretProviderType } from '../domain/secret-provider-type.js';
import { createSecretProvider } from '../infrastructure/secret-provider-factory.js';
import {
  ContractValidationError,
  checkRemoteKeys,
  invalidMapFileResult,
} from './contract-validation.js';
import { EnvilderClient } from './envilder-client.js';
import { MapFileParser } from './map-file-parser.js';
import { validateMapFileContent } from './map-file-validator.js';

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
 * await Envilder.load('envilder.json');
 *
 * // Resolve without injecting:
 * const secrets = await Envilder.resolveFile('envilder.json');
 *
 * // Fluent builder with provider override:
 * const secrets = await Envilder.fromMapFile('envilder.json')
 *   .withProvider(SecretProviderType.Azure)
 *   .withVaultUrl('https://my-vault.vault.azure.net')
 *   .inject();
 *
 * // Check the map file contract without loading anything:
 * const result = await Envilder.fromMapFile('envilder.json').validateContract();
 *
 * // Fail the load when the contract does not hold:
 * await Envilder.fromMapFile('envilder.json').withContractValidation().inject();
 * ```
 */
export class Envilder {
  private readonly filePath: string;
  private options: EnvilderOptions = {};
  private contractValidation = false;

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

  /**
   * Run {@link validateContract} once before resolving, and fail the load
   * with a {@link ContractValidationError} when it does not pass. Off by
   * default: without it, a load makes no extra provider call.
   */
  withContractValidation(): Envilder {
    this.contractValidation = true;
    return this;
  }

  /**
   * Checks the map file contract without reading any secret value: the map
   * file matches `spec/map-file.v1.json` and the provider configuration it
   * resolves to is coherent, and every declared secret exists. Expected
   * failures (invalid map file, missing secret, access denied, rejected
   * credentials, provider errors) are reported in the result, not thrown.
   * When the map file is invalid, no provider is called.
   */
  async validateContract(): Promise<ContractValidationResult> {
    const { result } = await this.checkContract(await this.readMapFile());
    return result;
  }

  /** Resolve secrets and return them as a Map. */
  async resolve(): Promise<Map<string, string>> {
    const json = await this.readMapFile();
    if (this.contractValidation) {
      const { result, mapFile, provider } = await this.checkContract(json);
      if (!result.isValid || mapFile === undefined || provider === undefined) {
        throw new ContractValidationError(result);
      }
      return new EnvilderClient(provider).resolveSecrets(mapFile);
    }
    const mapFile = new MapFileParser().parse(json);
    const provider = createSecretProvider(mapFile.config, this.buildOptions());
    const client = new EnvilderClient(provider);
    return client.resolveSecrets(mapFile);
  }

  /** Resolve secrets, inject into `process.env`, and return them. */
  async inject(): Promise<Map<string, string>> {
    const secrets = await this.resolve();
    EnvilderClient.injectIntoEnvironment(secrets);
    return secrets;
  }

  /**
   * Validates the map file and, when it is valid, checks every declared key
   * with the provider a load would use, which is returned for that load.
   */
  private async checkContract(json: string): Promise<{
    result: ContractValidationResult;
    mapFile?: ParsedMapFile;
    provider?: ISecretProvider;
  }> {
    const mapFileErrors = validateMapFileContent(json, this.options);
    if (mapFileErrors.length > 0) {
      return { result: invalidMapFileResult(mapFileErrors) };
    }
    const mapFile = new MapFileParser().parse(json);
    const options = this.buildOptions();
    const provider = createSecretProvider(mapFile.config, options);
    const providerType =
      options?.provider ?? mapFile.config.provider ?? SecretProviderType.Aws;
    const result = await checkRemoteKeys(mapFile, provider, providerType);
    return { result, mapFile, provider };
  }

  private async readMapFile(): Promise<string> {
    try {
      return await readFile(this.filePath, 'utf-8');
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
        throw new Error(`Map file not found: ${this.filePath}`);
      }
      throw err;
    }
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
