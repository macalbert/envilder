import {
  invalidEnvironmentVariableNameMessage,
  isValidEnvironmentVariableName,
  quoteName,
} from './EnvironmentVariableName.js';
import type { MapFileConfig } from './MapFileConfig.js';
import {
  DEFAULT_PROVIDER,
  fieldOutsideProviderMessage,
  PROVIDER_SPECIFIC_FIELDS,
  REQUIRED_PROVIDER_FIELDS,
  requiredFieldMessage,
  unsupportedProviderMessage,
} from './ProviderConfiguration.js';

/**
 * One reason a map file cannot be used. `key` names the offending entry
 * (`DB_URL`, `$config.profile`, `--provider`, or `(root)` for the document
 * itself), and `message` describes it on its own. Neither ever carries a
 * mapped value.
 */
export type MapFileViolation = {
  readonly key: string;
  readonly message: string;
};

/**
 * What the map file is checked against besides the schema: the provider
 * options given outside the file, which take precedence over `$config` as they
 * do on a run, and the providers the caller can actually use.
 */
export type MapFileValidationContext = {
  readonly overrides: MapFileConfig;
  readonly supportedProviders: readonly string[];
};

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

const OVERRIDE_FLAGS: Readonly<Record<string, string>> = {
  provider: '--provider',
  profile: '--profile',
  vaultUrl: '--vault-url',
};

/**
 * Checks a parsed map file against `spec/map-file.v1.json` and against the
 * provider configuration it resolves to, and returns every violation found
 * (an empty list when the file is usable). The cross-provider rules run on the
 * configuration a run would use, so a flag can both fix and break it.
 */
export function validateMapFile(
  document: unknown,
  context: MapFileValidationContext,
): MapFileViolation[] {
  if (!isJsonObject(document)) {
    return [{ key: '(root)', message: 'The map file must be a JSON object.' }];
  }

  const violations: MapFileViolation[] = [];
  let fileConfig: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(document)) {
    if (key === '$schema') {
      violations.push(...validateUri('$schema', value));
    } else if (key === '$config') {
      if (isJsonObject(value)) {
        fileConfig = value;
        violations.push(...validateConfigFields(value));
      } else {
        violations.push({
          key: '$config',
          message: '$config must be an object.',
        });
      }
    } else if (key.startsWith('$')) {
      violations.push({
        key,
        message: `${formatKey(key)} is reserved: only $schema and $config may start with "$".`,
      });
    } else {
      violations.push(...validateMapping(key, value));
    }
  }

  violations.push(...validateProviderConfiguration(fileConfig, context));
  return violations;
}

function validateMapping(key: string, value: unknown): MapFileViolation[] {
  const violations: MapFileViolation[] = [];
  if (!isValidEnvironmentVariableName(key)) {
    violations.push({
      key,
      message: `${invalidEnvironmentVariableNameMessage(key)}.`,
    });
  }
  if (typeof value !== 'string') {
    // The type only: the value itself may be a secret pasted by mistake.
    violations.push({
      key,
      message: `${formatKey(key)} must map to a string secret path, not ${describeType(value)}.`,
    });
  }
  return violations;
}

function validateConfigFields(
  config: Record<string, unknown>,
): MapFileViolation[] {
  const violations: MapFileViolation[] = [];
  for (const [field, value] of Object.entries(config)) {
    const key = `$config.${field}`;
    if (!CONFIG_FIELDS.includes(field)) {
      violations.push({
        key,
        message: `${formatKey(key)} is not a known field. Allowed fields: ${CONFIG_FIELDS.join(', ')}.`,
      });
    } else if (typeof value !== 'string') {
      violations.push({
        key,
        message: `${key} must be a string, not ${describeType(value)}.`,
      });
    } else if (URI_FIELDS.has(field)) {
      violations.push(...validateUri(key, value));
    }
  }
  return violations;
}

function validateUri(key: string, value: unknown): MapFileViolation[] {
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

/**
 * Resolves the configuration a run would use (flags over `$config`, `aws`
 * when no provider is named) and applies the cross-provider rules to it.
 * Fields with the wrong type are left to the schema checks above.
 */
function validateProviderConfiguration(
  fileConfig: Record<string, unknown>,
  context: MapFileValidationContext,
): MapFileViolation[] {
  const effective = resolveEffectiveConfig(fileConfig, context.overrides);
  const provider = effective.provider ?? {
    value: DEFAULT_PROVIDER,
    source: '$config.provider',
  };

  if (!context.supportedProviders.includes(provider.value)) {
    return [
      {
        key: provider.source,
        message: `${unsupportedProviderMessage(formatKey(provider.value), context.supportedProviders)}.`,
      },
    ];
  }

  const violations: MapFileViolation[] = [];
  for (const [field, validProviders] of Object.entries(
    PROVIDER_SPECIFIC_FIELDS,
  )) {
    const setting = effective[field];
    if (setting === undefined || validProviders.includes(provider.value)) {
      continue;
    }
    const usable = validProviders.filter((name) =>
      context.supportedProviders.includes(name),
    );
    violations.push({
      key: setting.source,
      message: fieldOutsideProviderMessage(
        setting.source,
        usable.length > 0 ? usable : validProviders,
        provider.value,
      ),
    });
  }

  const required = REQUIRED_PROVIDER_FIELDS[provider.value];
  if (required !== undefined && effective[required] === undefined) {
    violations.push({
      key: `$config.${required}`,
      message: requiredFieldMessage(required, provider.value),
    });
  }
  return violations;
}

function resolveEffectiveConfig(
  fileConfig: Record<string, unknown>,
  overrides: MapFileConfig,
): Record<string, SourcedValue | undefined> {
  const effective: Record<string, SourcedValue | undefined> = {};
  for (const field of CONFIG_FIELDS) {
    const value = fileConfig[field];
    if (typeof value === 'string') {
      effective[field] = { value, source: `$config.${field}` };
    }
  }
  // Empty flags are ignored, as they are on a run.
  for (const [field, flag] of Object.entries(OVERRIDE_FLAGS)) {
    const value = overrides[field as keyof MapFileConfig];
    if (value) {
      effective[field] = {
        value: field === 'provider' ? value.toLowerCase() : value,
        source: flag,
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
 * a key carrying a line break cannot split the report.
 */
function formatKey(key: string): string {
  return /^[A-Za-z0-9_$./-]+$/.test(key) ? key : quoteName(key);
}
