/**
 * A name Azure Key Vault accepts as it is: 1-127 letters, digits and hyphens.
 * @see https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates#objects-identifiers-and-versioning
 */
const AZURE_SECRET_NAME = /^[0-9A-Za-z-]{1,127}$/;

const MAX_LENGTH = 127;

/**
 * Turns a map-file reference into the Key Vault secret name, with the same
 * rule as the envilder CLI so every surface reads the same secret.
 *
 * A name Azure already accepts is used as written (`Database--Password`,
 * `1password-token`). Only a name Azure would reject is rewritten, the way
 * the CLI has always stored such secrets: `/myapp/db_password` becomes
 * `myapp-db-password`.
 */
export function toAzureSecretName(name: string): string {
  if (/[^a-zA-Z0-9\-_/]/.test(name)) {
    throw new Error(
      `Invalid secret name '${name}': contains characters not allowed by ` +
        'Azure Key Vault. Only alphanumeric characters, hyphens, slashes, ' +
        'and underscores are accepted.',
    );
  }
  if (AZURE_SECRET_NAME.test(name)) {
    return name;
  }

  const normalized = normalize(name);
  if (normalized.length > MAX_LENGTH) {
    throw new Error(
      `Invalid secret name '${name}': normalized name '${normalized}' ` +
        `exceeds the ${MAX_LENGTH}-character limit for Azure Key Vault.`,
    );
  }
  return normalized;
}

function normalize(name: string): string {
  let normalized = name
    .replace(/^\/+/, '')
    .replace(/[/_]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (normalized.length > 0 && !/^[a-z]/.test(normalized)) {
    normalized = `secret-${normalized}`;
  }
  return normalized.length === 0 ? 'secret' : normalized;
}
