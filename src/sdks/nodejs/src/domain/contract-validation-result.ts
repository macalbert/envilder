import type { SecretProviderType } from './secret-provider-type.js';

/**
 * Whether a secret declared in the map file can be resolved, checked without
 * reading its value. Same statuses as `envilder validate`:
 *
 * - `exists`: the secret is there and the identity can see it.
 * - `missing`: the provider answered that there is no such secret.
 * - `access_denied`: the identity is not allowed to check the secret, so
 *   whether it exists is unknown. Never reported as `missing`.
 * - `authentication_failed`: the provider rejected the credentials.
 * - `provider_error`: anything else, for example an unreachable provider.
 */
export type SecretExistenceStatus =
  | 'exists'
  | 'missing'
  | 'access_denied'
  | 'authentication_failed'
  | 'provider_error';

/**
 * The outcome of checking one secret path. `reason` explains a status other
 * than `exists` or `missing` when the provider gave one; it never carries a
 * secret value.
 */
export interface SecretExistence {
  readonly status: SecretExistenceStatus;
  readonly reason?: string;
}

/**
 * One reason the map file cannot be used. `key` names the offending entry
 * (`DB_URL`, `$config.profile`, `withProfile()`, or `(root)` for the document
 * itself). Neither field ever carries a mapped value.
 */
export interface MapFileError {
  readonly key: string;
  readonly message: string;
}

/** One variable of the map file with the outcome for the path it maps to. */
export interface KeyCheck extends SecretExistence {
  readonly variable: string;
  readonly path: string;
  readonly provider: SecretProviderType;
}

/**
 * The outcome of checking a map file contract: the map file is valid and
 * every declared secret exists. When the map file is invalid, `keys` is empty
 * because no provider was called.
 */
export interface ContractValidationResult {
  readonly isValid: boolean;
  readonly mapFileErrors: readonly MapFileError[];
  readonly keys: readonly KeyCheck[];
}
