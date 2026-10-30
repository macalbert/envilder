import type { SecretExistence } from '../SecretExistence.js';

export interface ISecretProvider {
  getSecret(name: string): Promise<string | undefined>;
  setSecret(name: string, value: string): Promise<void>;
  /**
   * Checks whether each named secret exists without reading its value, in as
   * few provider calls as the provider allows. Returns one entry per distinct
   * name. Expired credentials and SSO sessions are thrown
   * (`ExpiredCredentialsError`, `SsoSessionExpiredError`) so the caller can
   * recover; every other failure becomes the status of the names it affects.
   */
  checkSecretsExist(
    names: readonly string[],
  ): Promise<ReadonlyMap<string, SecretExistence>>;
  logIdentity?(): Promise<void>;
}
