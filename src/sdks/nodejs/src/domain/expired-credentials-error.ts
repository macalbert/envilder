/**
 * Thrown when an AWS request fails because the credentials or security token
 * are expired or invalid (for example, an expired SSO session).
 */
export class ExpiredCredentialsError extends Error {
  constructor(cause?: unknown) {
    super(
      'AWS credentials are expired or invalid. Your security token or SSO ' +
        'session may have expired. Refresh your credentials and retry ' +
        '(for SSO, run: aws sso login).',
    );
    this.name = 'ExpiredCredentialsError';
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

const EXPIRED_CREDENTIAL_ERROR_NAMES = new Set([
  'ExpiredToken',
  'ExpiredTokenException',
  'UnrecognizedClientException',
  'InvalidClientTokenId',
  'InvalidSignatureException',
  'CredentialsProviderError',
  'TokenRefreshRequired',
  'RequestExpired',
]);

const EXPIRED_CREDENTIAL_MESSAGE_PATTERN =
  /expired|security token.*invalid|invalid.*security token|could not load credentials|sso session|token has expired|refresh.*failed/i;

/**
 * Detects whether an unknown error represents expired or invalid AWS
 * credentials, by inspecting its error name and message.
 */
export function isExpiredCredentialsError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const name =
    'name' in error ? String((error as { name?: unknown }).name) : '';
  if (EXPIRED_CREDENTIAL_ERROR_NAMES.has(name)) {
    return true;
  }
  const message =
    'message' in error ? String((error as { message?: unknown }).message) : '';
  return EXPIRED_CREDENTIAL_MESSAGE_PATTERN.test(message);
}
