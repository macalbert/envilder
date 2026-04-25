/**
 * Thrown when resolved secrets contain missing or empty values.
 */
export class SecretValidationError extends Error {
  /**
   * Keys whose values were empty or whitespace-only.
   * Empty array when no secrets were resolved at all.
   */
  readonly missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(
      missingKeys.length === 0
        ? 'No secrets were resolved.'
        : `The following secrets have empty or missing values: ${missingKeys.join(', ')}`,
    );
    this.missingKeys = missingKeys;
    this.name = 'SecretValidationError';
  }
}

/**
 * Validates that all resolved secrets have non-empty values.
 *
 * @throws {SecretValidationError} When the map is empty or any value is empty/whitespace.
 */
export function validateSecrets(secrets: ReadonlyMap<string, string>): void {
  if (secrets.size === 0) {
    throw new SecretValidationError([]);
  }

  const missingKeys: string[] = [];
  for (const [key, value] of secrets) {
    if (!value || !value.trim()) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    throw new SecretValidationError(missingKeys);
  }
}
