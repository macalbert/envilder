/**
 * Which `$config` fields each provider accepts, and the messages that report a
 * provider configuration that cannot work. Shared by the provider wiring (pull,
 * push, exec) and the map file validator, so a check and a run describe the
 * same problem with the same words.
 */

/** Every provider the map file schema (`spec/map-file.v1.json`) declares. */
export const MAP_FILE_PROVIDERS: readonly string[] = [
  'aws',
  'azure',
  'gcp',
  'hashicorp',
  'file',
];

export const DEFAULT_PROVIDER = 'aws';

/** Provider-specific `$config` fields and the providers that accept each. */
export const PROVIDER_SPECIFIC_FIELDS: Readonly<
  Record<string, readonly string[]>
> = {
  profile: ['aws'],
  vaultUrl: ['azure', 'hashicorp'],
  projectId: ['gcp'],
  namespace: ['hashicorp'],
  path: ['file'],
};

/** The `$config` field each provider cannot work without. */
export const REQUIRED_PROVIDER_FIELDS: Readonly<Record<string, string>> = {
  azure: 'vaultUrl',
  gcp: 'projectId',
  hashicorp: 'vaultUrl',
  file: 'path',
};

const PROVIDER_LABELS: Readonly<Record<string, string>> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  hashicorp: 'HashiCorp',
  file: 'file',
};

const FIELD_FLAGS: Readonly<Record<string, string>> = {
  profile: '--profile',
  vaultUrl: '--vault-url',
};

export function unsupportedProviderMessage(
  provider: string,
  supportedProviders: readonly string[],
): string {
  return (
    `Unsupported provider: ${provider}.` +
    ` Supported providers:` +
    ` ${supportedProviders.join(', ')}`
  );
}

/**
 * Reports a provider-specific field set for a provider that does not use it.
 * `subject` names where the field came from, such as `--profile` or
 * `$config.profile`.
 */
export function fieldOutsideProviderMessage(
  subject: string,
  validProviders: readonly string[],
  provider: string,
): string {
  return (
    `${subject} is only supported with the` +
    ` ${validProviders.join(' or ')} provider` +
    ` (current provider: ${provider}).`
  );
}

export function requiredFieldMessage(field: string, provider: string): string {
  const flag = FIELD_FLAGS[field];
  return (
    `${field} is required when using` +
    ` ${PROVIDER_LABELS[provider] ?? provider} provider.` +
    ` Set it in $config.${field} in your map file` +
    (flag === undefined ? '.' : ` or via ${flag} flag.`)
  );
}
