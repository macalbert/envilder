/**
 * Abstracts access to a secret store (e.g. AWS SSM Parameter Store, Azure Key Vault).
 * Implement this interface to add support for a new secret provider.
 */
export interface ISecretProvider {
  /**
   * Retrieves a single secret by its provider-specific identifier.
   *
   * For AWS SSM this is the parameter path (e.g. `/app/db-url`);
   * for Azure Key Vault this is the secret name.
   *
   * @returns The secret value, or `null` when the secret does not exist.
   */
  getSecret(name: string): Promise<string | null>;
}
