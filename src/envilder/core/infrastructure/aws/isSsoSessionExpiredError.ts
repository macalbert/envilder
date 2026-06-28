const SSO_SESSION_EXPIRED_ERROR_NAMES = new Set(['TokenProviderError']);

export function isSsoSessionExpiredError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('name' in error)) {
    return false;
  }
  const name = String((error as { name?: unknown }).name);
  return SSO_SESSION_EXPIRED_ERROR_NAMES.has(name);
}
