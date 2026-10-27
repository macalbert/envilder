export const DEFAULT_VAULT_HOSTS: readonly string[] = [
  '.vault.azure.net',
  '.vault.azure.cn',
  '.vault.usgovcloudapi.net',
  '.vault.microsoftazure.de',
];

/**
 * Checks `vaultUrl` before any credential is sent to it and returns its
 * hostname. Throws when the URL is not `https://` or its hostname does not
 * end with one of `allowedHosts`.
 */
export function validateAzureVaultUrl(
  vaultUrl: string,
  allowedHosts: readonly string[],
): string {
  let url: URL;
  try {
    url = new URL(vaultUrl);
  } catch {
    throw new Error('vaultUrl must be a valid URL');
  }

  if (url.protocol !== 'https:') {
    throw new Error('vaultUrl must use https:// protocol');
  }

  if (url.username || url.password) {
    throw new Error('vaultUrl must not contain user information');
  }

  if (!isAllowedVaultHost(url.hostname, allowedHosts)) {
    throw new Error(
      `vaultUrl hostname must end with one of: ${allowedHosts.join(', ')}`,
    );
  }

  return url.hostname;
}

export function isAllowedVaultHost(
  hostname: string,
  allowedHosts: readonly string[],
): boolean {
  const host = hostname.toLowerCase();
  return allowedHosts.some((suffix) => {
    const normalized = suffix.trim().replace(/^\.+/, '').toLowerCase();
    if (!normalized) {
      return false;
    }
    return host === normalized || host.endsWith(`.${normalized}`);
  });
}
