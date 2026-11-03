import type {
  ContractValidationResult,
  KeyCheck,
  MapFileError,
} from '../domain/contract-validation-result.js';
import type { ParsedMapFile } from '../domain/parsed-map-file.js';
import type { ISecretExistenceChecker } from '../domain/ports/secret-existence-checker.js';
import type { SecretProviderType } from '../domain/secret-provider-type.js';

/**
 * Thrown by a load with contract validation enabled when the map file is
 * invalid or a declared secret cannot be confirmed. The message names the
 * failing keys and paths, never a secret value.
 */
export class ContractValidationError extends Error {
  /** The full outcome of the check that failed. */
  readonly result: ContractValidationResult;

  constructor(result: ContractValidationResult) {
    super(buildMessage(result));
    this.result = result;
    this.name = 'ContractValidationError';
  }
}

/** The result for a map file that failed validation: no provider was called. */
export function invalidMapFileResult(
  mapFileErrors: readonly MapFileError[],
): ContractValidationResult {
  return { isValid: false, mapFileErrors, keys: [] };
}

/**
 * Checks that every secret path declared in a valid map file exists, without
 * reading any value. A path shared by several variables is checked once.
 * Returns one check per variable, in map-file order.
 */
export async function checkRemoteKeys(
  mapFile: ParsedMapFile,
  checker: ISecretExistenceChecker,
  provider: SecretProviderType,
): Promise<ContractValidationResult> {
  const mappings = [...mapFile.mappings];
  const existence =
    mappings.length === 0
      ? new Map()
      : await checker.checkSecretsExist([
          ...new Set(mappings.map(([, path]) => path)),
        ]);
  const keys: KeyCheck[] = mappings.map(([variable, path]) => ({
    variable,
    path,
    provider,
    ...(existence.get(path) ?? {
      status: 'provider_error',
      reason: 'The provider returned no result for this secret.',
    }),
  }));
  return {
    isValid: keys.every((key) => key.status === 'exists'),
    mapFileErrors: [],
    keys,
  };
}

function buildMessage(result: ContractValidationResult): string {
  if (result.mapFileErrors.length > 0) {
    const details = result.mapFileErrors
      .map((error) => `${error.key}: ${error.message}`)
      .join('; ');
    return `Map file contract validation failed: ${details}`;
  }
  const details = result.keys
    .filter((key) => key.status !== 'exists')
    .map((key) => `${key.variable} (${key.path}): ${key.status}`)
    .join(', ');
  return `Map file contract validation failed: ${details}`;
}
