import type { SecretExistence } from '../contract-validation-result.js';

/**
 * Checks whether secrets exist without reading their values. Implemented by
 * the built-in providers and used by contract validation; kept apart from
 * {@link ISecretProvider} so custom providers do not have to implement it.
 * A custom provider passed to `withSecretProvider()` implements it to take
 * part in contract validation.
 */
export interface ISecretExistenceChecker {
  /**
   * Returns one entry per distinct name. Expected failures (missing secret,
   * access denied, rejected credentials, unreachable provider) become the
   * status of the names they affect instead of being thrown.
   */
  checkSecretsExist(
    names: readonly string[],
  ): Promise<ReadonlyMap<string, SecretExistence>>;
}
