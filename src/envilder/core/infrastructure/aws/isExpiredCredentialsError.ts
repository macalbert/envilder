const EXPIRED_CREDENTIAL_ERROR_NAMES = new Set([
  'ExpiredToken',
  'ExpiredTokenException',
]);

export function isExpiredCredentialsError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('name' in error)) {
    return false;
  }
  const name = String((error as { name?: unknown }).name);
  return EXPIRED_CREDENTIAL_ERROR_NAMES.has(name);
}
