/**
 * Thrown when an AWS request fails because the credentials or security token
 * are expired or invalid (for example, an expired SSO session).
 */
export class ExpiredCredentialsError extends Error {
  readonly cause?: unknown;

  constructor(cause?: unknown) {
    super(
      'AWS credentials are expired or invalid. Your security token or SSO ' +
        'session may have expired. Refresh your credentials and retry ' +
        '(for SSO, run: aws sso login).',
    );
    this.name = 'ExpiredCredentialsError';
    this.cause = cause;
  }
}

const EXPIRED_CREDENTIAL_ERROR_NAMES = new Set([
  'ExpiredToken',
  'ExpiredTokenException',
  'TokenProviderError',
  'TokenRefreshRequired',
]);

/**
 * Detects whether an unknown error represents expired or invalid AWS
 * credentials, by inspecting its AWS error name.
 */
export function isExpiredCredentialsError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('name' in error)) {
    return false;
  }
  const name = String((error as { name?: unknown }).name);
  return EXPIRED_CREDENTIAL_ERROR_NAMES.has(name);
}
