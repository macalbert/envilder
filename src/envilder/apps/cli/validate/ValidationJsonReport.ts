import {
  type EnvFileKeyComparison,
  type EnvValueCheck,
  type EnvValueStatus,
  summarizeEnvFileFailures,
  summarizeValueFailures,
} from '../../../core/domain/EnvFileComparison.js';
import type { MapFileViolation } from '../../../core/domain/MapFileValidator.js';
import {
  type RemoteKeyCheck,
  type SecretExistenceStatus,
  summarizeFailures,
} from '../../../core/domain/SecretExistence.js';
import { describeError } from '../../../core/infrastructure/describeError.js';

/**
 * What `envilder validate` found, step by step. A step that did not run, for
 * example the remote check with `--offline` or after an invalid map file, is
 * left out.
 */
export type ValidationResults = {
  offline: boolean;
  mapFile?: {
    readonly path: string;
    readonly violations: readonly MapFileViolation[];
  };
  keys?: {
    readonly provider: string;
    readonly checks: readonly RemoteKeyCheck[];
  };
  envFile?: {
    readonly path: string;
    readonly comparison: EnvFileKeyComparison;
  };
  values?: readonly EnvValueCheck[];
};

export type ValidationJsonKey = {
  name: string;
  provider: string;
  path: string;
  status: SecretExistenceStatus;
  reason?: string;
};

export type ValidationJsonEnvFileKey = {
  name: string;
  status: 'present' | 'missing';
  value?: EnvValueStatus;
  reason?: string;
};

/**
 * The document `envilder validate --format json` prints. A section is `null`
 * when its step did not run. It never carries a secret value: value
 * comparison only reports `matches`, `differs` or `unreadable`.
 */
export type ValidationJson = {
  valid: boolean;
  offline: boolean;
  mapFile: {
    path: string;
    valid: boolean;
    errors: { key: string; message: string }[];
  } | null;
  keys: ValidationJsonKey[] | null;
  envFile: {
    path: string;
    valid: boolean;
    keys: ValidationJsonEnvFileKey[];
    duplicates: { name: string; count: number }[];
    undeclared: string[];
  } | null;
  error: { message: string } | null;
};

/**
 * Shapes the validation results as JSON. `error` is what stopped the run
 * before every step finished, such as expired credentials; a failed check is
 * not an error.
 */
export function toValidationJson(
  results: ValidationResults,
  error?: unknown,
): ValidationJson {
  const mapFile = results.mapFile && {
    path: results.mapFile.path,
    valid: results.mapFile.violations.length === 0,
    errors: results.mapFile.violations.map(({ key, message }) => ({
      key,
      message,
    })),
  };
  const keys = results.keys?.checks.map((check) =>
    toKey(check, results.keys?.provider ?? ''),
  );
  const envFile = results.envFile && toEnvFile(results.envFile, results.values);

  return {
    valid:
      error === undefined &&
      mapFile?.valid === true &&
      summarizeFailures(results.keys?.checks ?? []) === '' &&
      (envFile?.valid ?? true),
    offline: results.offline,
    mapFile: mapFile ?? null,
    keys: keys ?? null,
    envFile: envFile ?? null,
    error: error === undefined ? null : { message: describeError(error) },
  };
}

function toKey(check: RemoteKeyCheck, provider: string): ValidationJsonKey {
  return {
    name: check.variable,
    provider,
    path: check.path,
    status: check.status,
    ...(check.reason !== undefined && { reason: check.reason }),
  };
}

function toEnvFile(
  envFile: NonNullable<ValidationResults['envFile']>,
  values: readonly EnvValueCheck[] | undefined,
): NonNullable<ValidationJson['envFile']> {
  const { comparison } = envFile;
  const valueChecks = new Map(values?.map((check) => [check.variable, check]));
  const present = comparison.present.map((name) => {
    const value = valueChecks.get(name);
    return {
      name,
      status: 'present' as const,
      ...(value !== undefined && { value: value.status }),
      ...(value?.reason !== undefined && { reason: value.reason }),
    };
  });
  const missing = comparison.missing.map((name) => ({
    name,
    status: 'missing' as const,
  }));

  return {
    path: envFile.path,
    valid:
      summarizeEnvFileFailures(comparison, envFile.path) === '' &&
      summarizeValueFailures(values ?? []) === '',
    keys: [...present, ...missing],
    duplicates: comparison.duplicates.map(({ key, count }) => ({
      name: key,
      count,
    })),
    undeclared: [...comparison.undeclared],
  };
}
