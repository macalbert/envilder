/**
 * Abstracts access to a secret store (e.g. AWS SSM Parameter Store, Azure Key Vault).
 * Implement this interface to add support for a new secret provider.
 */
export interface ISecretProvider {
  /**
   * Retrieves multiple secrets by their provider-specific identifiers.
   *
   * For AWS SSM these are parameter paths (e.g. `/app/db-url`);
   * for Azure Key Vault these are secret names.
   *
   * Secrets that do not exist are silently omitted from the result.
   *
   * @returns A map of name → value for secrets that were found.
   */
  getSecrets(names: string[]): Promise<Map<string, string>>;
}
