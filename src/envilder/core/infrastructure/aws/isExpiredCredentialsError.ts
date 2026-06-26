const EXPIRED_CREDENTIAL_ERROR_NAMES = new Set([
  'ExpiredToken',
  'ExpiredTokenException',
  'UnrecognizedClient',
  'UnrecognizedClientException',
  'InvalidClientTokenId',
  'InvalidSignatureException',
  'CredentialsProviderError',
  'TokenRefreshRequired',
  'RequestExpired',
]);

const EXPIRED_CREDENTIAL_MESSAGE_PATTERN =
  /expired|security token.*invalid|invalid.*security token|could not load credentials|sso session|token has expired|refresh.*failed/i;

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
