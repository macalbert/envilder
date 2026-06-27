/**
 * Thrown when the AWS SSO session for the active profile could not be loaded
 * or has expired, so credentials cannot be resolved.
 */
export class SsoSessionExpiredError extends Error {
  readonly profileName?: string;
  readonly cause?: unknown;

  constructor(profileName?: string, cause?: unknown) {
    super(SsoSessionExpiredError.buildMessage(profileName));
    this.name = 'SsoSessionExpiredError';
    this.profileName = profileName;
    this.cause = cause;
  }

  private static buildMessage(profileName?: string): string {
    if (profileName) {
      return (
        `Your AWS SSO session for profile '${profileName}' could not be ` +
        `loaded or has expired. Run: aws sso login --profile ${profileName} ` +
        'and then re-run this command.'
      );
    }
    return (
      'Your AWS SSO session could not be loaded or has expired. Run: ' +
      'aws sso login and then re-run this command.'
    );
  }
}

const SSO_SESSION_EXPIRED_ERROR_NAMES = new Set([
  'TokenProviderError',
  'TokenRefreshRequired',
]);

/**
 * Detects whether an unknown error represents an expired or unresolved AWS SSO
 * session, by inspecting its AWS error name.
 */
export function isSsoSessionExpiredError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('name' in error)) {
    return false;
  }
  const name = String((error as { name?: unknown }).name);
  return SSO_SESSION_EXPIRED_ERROR_NAMES.has(name);
}
