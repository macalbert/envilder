/**
 * The only translation between a map-file reference and a Key Vault secret
 * name, shared with the envilder CLI: `/` becomes `-`, ignoring leading
 * slashes, so a path-style reference such as `/myapp/db/password` reads
 * `myapp-db-password`. Anything else reaches Key Vault as written, and a
 * name it does not accept fails with Key Vault's own error.
 * @see https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
 */
export function toAzureSecretName(name: string): string {
  return name.replace(/^\/+/, '').replace(/\//g, '-');
}
