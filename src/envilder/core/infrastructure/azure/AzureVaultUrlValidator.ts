import { InvalidArgumentError } from '../../domain/errors/DomainErrors.js';

export const DEFAULT_VAULT_HOSTS = [
  '.vault.azure.net',
  '.vault.azure.cn',
  '.vault.usgovcloudapi.net',
  '.vault.microsoftazure.de',
];

export function validateAzureVaultUrl(
  vaultUrl: string,
  allowedHosts: string[],
): void {
  let url: URL;
  try {
    url = new URL(vaultUrl);
  } catch {
    throw new InvalidArgumentError('vaultUrl must be a valid URL');
  }

  if (url.protocol !== 'https:') {
    throw new InvalidArgumentError('vaultUrl must use https:// protocol');
  }

  const isAllowedHost = allowedHosts.some((suffix) => {
    const normalizedSuffix = suffix.startsWith('.') ? suffix.slice(1) : suffix;
    return (
      url.hostname === normalizedSuffix ||
      url.hostname.endsWith(`.${normalizedSuffix}`)
    );
  });
  if (!isAllowedHost) {
    throw new InvalidArgumentError(
      `vaultUrl hostname must end with one of: ${allowedHosts.join(', ')}`,
    );
  }
}
