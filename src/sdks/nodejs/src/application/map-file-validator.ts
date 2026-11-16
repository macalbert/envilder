import type { MapFileError } from '../domain/contract-validation-result.js';
import type { EnvilderOptions } from '../domain/envilder-options.js';
import {
  invalidEnvironmentVariableNameMessage,
  isValidEnvironmentVariableName,
  quoteName,
} from '../domain/environment-variable-name.js';

/**
 * Checks a map file against `spec/map-file.v1.json` and the provider
 * configuration it resolves to, with the same rules and wording as
 * `envilder validate --offline`. The SDK supports fewer providers than the
 * schema declares, so `gcp`, `hashicorp` and `file` are reported as
 * unsupported. Builder overrides take precedence over `$config`, as they do
 * on a load. No mapped value ever reaches an error.
 */

const SUPPORTED_PROVIDERS: readonly string[] = ['aws', 'azure'];

const DEFAULT_PROVIDER = 'aws';

const CONFIG_FIELDS = [
  'provider',
  'profile',
  'vaultUrl',
  'projectId',
  'namespace',
  'path',
  'name',
  'description',
  'owner',
  'environment',
];

const URI_FIELDS = new Set(['vaultUrl']);

/** Provider-specific `$config` fields and the providers that accept each. */
const PROVIDER_SPECIFIC_FIELDS: Readonly<Record<string, readonly string[]>> = {
  profile: ['aws'],
  vaultUrl: ['azure', 'hashicorp'],
  projectId: ['gcp'],
  namespace: ['hashicorp'],
  path: ['file'],
};

/** The `$config` field each supported provider cannot work without. */
const REQUIRED_PROVIDER_FIELDS: Readonly<Record<string, string>> = {
  azure: 'vaultUrl',
};

const PROVIDER_LABELS: Readonly<Record<string, string>> = {
  aws: 'AWS',
  azure: 'Azure',
};

/** The builder method that overrides each field, named in errors. */
const OVERRIDE_METHODS: Readonly<Record<string, string>> = {
  provider: 'withProvider()',
  profile: 'withProfile()',
  vaultUrl: 'withVaultUrl()',
};

/** Parses and validates the raw content of a map file. */
export function validateMapFileContent(
  json: string,
  overrides: EnvilderOptions,
): MapFileError[] {
  let document: unknown;
  try {
    document = JSON.parse(json);
  } catch {
    // The parser's message quotes the surrounding text, which can be a
    // secret pasted into the file, so it is not repeated.
    return [{ key: '(root)', message: 'The map file is not valid JSON.' }];
  }
  return validateMapFile(document, overrides);
}

/** Validates a parsed map file and returns every error found. */
export function validateMapFile(
  document: unknown,
  overrides: EnvilderOptions,
): MapFileError[] {
  if (!isJsonObject(document)) {
    return [{ key: '(root)', message: 'The map file must be a JSON object.' }];
  }

  const errors: MapFileError[] = [];
  let fileConfig: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(document)) {
    if (key === '$schema') {
      errors.push(...validateUri('$schema', value));
    } else if (key === '$config') {
      if (isJsonObject(value)) {
        fileConfig = value;
        errors.push(...validateConfigFields(value));
      } else {
        errors.push({ key: '$config', message: '$config must be an object.' });
      }
    } else if (key.startsWith('$')) {
      errors.push({
        key,
        message: `${formatKey(key)} is reserved: only $schema and $config may start with "$".`,
      });
    } else {
      errors.push(...validateMapping(key, value));
    }
  }

  errors.push(...validateProviderConfiguration(fileConfig, overrides));
  return errors;
}

function validateMapping(key: string, value: unknown): MapFileError[] {
  const errors: MapFileError[] = [];
  if (!isValidEnvironmentVariableName(key)) {
    errors.push({
      key,
      message: `${invalidEnvironmentVariableNameMessage(key)}.`,
    });
  }
  if (typeof value !== 'string') {
    // The type only: the value itself may be a secret pasted by mistake.
    errors.push({
      key,
      message: `${formatKey(key)} must map to a string secret path, not ${describeType(value)}.`,
    });
  }
  return errors;
}

function validateConfigFields(config: Record<string, unknown>): MapFileError[] {
  const errors: MapFileError[] = [];
  for (const [field, value] of Object.entries(config)) {
    const key = `$config.${field}`;
    if (!CONFIG_FIELDS.includes(field)) {
      errors.push({
        key,
        message: `${formatKey(key)} is not a known field. Allowed fields: ${CONFIG_FIELDS.join(', ')}.`,
      });
    } else if (typeof value !== 'string') {
      errors.push({
        key,
        message: `${key} must be a string, not ${describeType(value)}.`,
      });
    } else if (URI_FIELDS.has(field)) {
      errors.push(...validateUri(key, value));
    }
  }
  return errors;
}

function validateUri(key: string, value: unknown): MapFileError[] {
  if (typeof value !== 'string') {
    return [
      { key, message: `${key} must be a string, not ${describeType(value)}.` },
    ];
  }
  if (!isUri(value)) {
    return [{ key, message: `${key} must be an absolute URI.` }];
  }
  return [];
}

/** A configuration field with the key that named it, for the report. */
type SourcedValue = { readonly value: string; readonly source: string };

function validateProviderConfiguration(
  fileConfig: Record<string, unknown>,
  overrides: EnvilderOptions,
): MapFileError[] {
  const effective = resolveEffectiveConfig(fileConfig, overrides);
  const provider = effective.provider ?? {
    value: DEFAULT_PROVIDER,
    source: '$config.provider',
  };

  if (!SUPPORTED_PROVIDERS.includes(provider.value)) {
    return [
      {
        key: provider.source,
        message:
          `Unsupported provider: ${formatKey(provider.value)}.` +
          ` Supported providers: ${SUPPORTED_PROVIDERS.join(', ')}.`,
      },
    ];
  }

  const errors: MapFileError[] = [];
  for (const [field, validProviders] of Object.entries(
    PROVIDER_SPECIFIC_FIELDS,
  )) {
    const setting = effective[field];
    if (setting === undefined || validProviders.includes(provider.value)) {
      continue;
    }
    const usable = validProviders.filter((name) =>
      SUPPORTED_PROVIDERS.includes(name),
    );
    errors.push({
      key: setting.source,
      message:
        `${setting.source} is only supported with the` +
        ` ${(usable.length > 0 ? usable : validProviders).join(' or ')} provider` +
        ` (current provider: ${provider.value}).`,
    });
  }

  const required = REQUIRED_PROVIDER_FIELDS[provider.value];
  if (required !== undefined && effective[required] === undefined) {
    errors.push({
      key: `$config.${required}`,
      message:
        `${required} is required when using` +
        ` ${PROVIDER_LABELS[provider.value]} provider.` +
        ` Set it in $config.${required} in your map file` +
        ` or via ${OVERRIDE_METHODS[required]}.`,
    });
  }
  return errors;
}

function resolveEffectiveConfig(
  fileConfig: Record<string, unknown>,
  overrides: EnvilderOptions,
): Record<string, SourcedValue | undefined> {
  const effective: Record<string, SourcedValue | undefined> = {};
  for (const field of CONFIG_FIELDS) {
    const value = fileConfig[field];
    if (typeof value === 'string') {
      effective[field] = { value, source: `$config.${field}` };
    }
  }
  // Blank overrides are ignored, as they are on a load.
  for (const [field, method] of Object.entries(OVERRIDE_METHODS)) {
    const value = overrides[field as keyof EnvilderOptions]?.trim();
    if (value) {
      effective[field] = {
        value: field === 'provider' ? value.toLowerCase() : value,
        source: method,
      };
    }
  }
  return effective;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUri(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9+.-]*:\S*$/.test(value) && URL.canParse(value);
}

function describeType(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'an array';
  }
  return typeof value === 'object' ? 'an object' : `a ${typeof value}`;
}

/**
 * Keys are untrusted input: anything outside a plain identifier is quoted, so
 * a key carrying a line break cannot split a message.
 */
function formatKey(key: string): string {
  return /^[A-Za-z0-9_$./-]+$/.test(key) ? key : quoteName(key);
}
