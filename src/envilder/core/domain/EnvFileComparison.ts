/** One `KEY=value` assignment of an env file, in file order. */
export type EnvFileEntry = {
  readonly key: string;
  readonly value: string;
};

/** A key assigned more than once in the env file. */
export type EnvFileDuplicate = {
  readonly key: string;
  readonly count: number;
};

/**
 * How the keys of an env file line up with the variables a map file declares:
 *
 * - `present`: declared in the map file and in the env file.
 * - `missing`: declared in the map file, absent from the env file. Fails.
 * - `undeclared`: only in the env file. A warning; it never fails.
 * - `duplicates`: assigned more than once in the env file. Fails.
 *
 * `KEY=` counts as present. Keys compare case-sensitively. No value is kept.
 */
export type EnvFileKeyComparison = {
  readonly present: readonly string[];
  readonly missing: readonly string[];
  readonly undeclared: readonly string[];
  readonly duplicates: readonly EnvFileDuplicate[];
};

/**
 * The outcome of comparing one declared variable's local value with its
 * remote value. `unreadable` means the remote value could not be read, with
 * the provider's `reason`; it never carries either value.
 */
export type EnvValueStatus = 'matches' | 'differs' | 'unreadable';

export type EnvValueCheck = {
  readonly variable: string;
  readonly path: string;
  readonly status: EnvValueStatus;
  readonly reason?: string;
};

export function compareEnvFileKeys(
  declared: readonly string[],
  entries: readonly EnvFileEntry[],
): EnvFileKeyComparison {
  const counts = new Map<string, number>();
  for (const { key } of entries) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const declaredKeys = new Set(declared);

  return {
    present: declared.filter((key) => counts.has(key)),
    missing: declared.filter((key) => !counts.has(key)),
    undeclared: [...counts.keys()].filter((key) => !declaredKeys.has(key)),
    duplicates: [...counts]
      .filter(([, count]) => count > 1)
      .map(([key, count]) => ({ key, count })),
  };
}

/**
 * Counts what makes the env file fail, for example `1 missing from .env, 1
 * duplicated in .env`. Empty when only warnings remain.
 */
export function summarizeEnvFileFailures(
  comparison: EnvFileKeyComparison,
  envFileName: string,
): string {
  const { missing, duplicates } = comparison;
  return [
    missing.length > 0 ? `${missing.length} missing from ${envFileName}` : '',
    duplicates.length > 0
      ? `${duplicates.length} duplicated in ${envFileName}`
      : '',
  ]
    .filter((part) => part !== '')
    .join(', ');
}

/**
 * Counts the values that fail, for example `2 differ, 1 unreadable`. Empty
 * when every compared value matches.
 */
export function summarizeValueFailures(
  checks: readonly EnvValueCheck[],
): string {
  const differs = checks.filter((check) => check.status === 'differs').length;
  const unreadable = checks.filter(
    (check) => check.status === 'unreadable',
  ).length;
  return [
    differs > 0 ? `${differs} ${differs === 1 ? 'differs' : 'differ'}` : '',
    unreadable > 0 ? `${unreadable} unreadable` : '',
  ]
    .filter((part) => part !== '')
    .join(', ');
}
