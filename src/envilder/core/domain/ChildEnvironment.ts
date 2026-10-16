export type ChildEnvironment = {
  /** Complete environment for the child process. */
  env: Record<string, string>;
  /** Names of inherited variables replaced by a resolved one. */
  overridden: string[];
};

/**
 * Composes the environment of an exec child: the inherited environment plus
 * the resolved secrets, where the map file wins on conflicts.
 *
 * On Windows environment names are case-insensitive, so an inherited `Path`
 * and a mapped `PATH` are the same variable and the child must get only one.
 * Values are copied as-is: no escaping, quoting or trimming.
 */
export function buildChildEnvironment(
  inherited: Readonly<Record<string, string | undefined>>,
  resolved: Readonly<Record<string, string>>,
  platform: string,
): ChildEnvironment {
  const normalize =
    platform === 'win32'
      ? (name: string) => name.toUpperCase()
      : (name: string) => name;
  const resolvedNames = new Set(Object.keys(resolved).map(normalize));

  // Null prototype: an inherited variable named `__proto__` must stay an own
  // property instead of going through the Object.prototype setter.
  const env: Record<string, string> = Object.create(null);
  const overridden: string[] = [];
  for (const [name, value] of Object.entries(inherited)) {
    if (value === undefined) {
      continue;
    }
    if (resolvedNames.has(normalize(name))) {
      overridden.push(name);
      continue;
    }
    env[name] = value;
  }
  for (const [name, value] of Object.entries(resolved)) {
    env[name] = value;
  }

  return { env, overridden };
}

/**
 * Groups of variable names that the platform treats as one variable. On
 * Windows names are case-insensitive, so `Path` and `PATH` collide; on other
 * platforms there are never collisions.
 */
export function findCaseCollisions(
  names: readonly string[],
  platform: string,
): string[][] {
  if (platform !== 'win32') {
    return [];
  }
  const groups = new Map<string, string[]>();
  for (const name of names) {
    const key = name.toUpperCase();
    groups.set(key, [...(groups.get(key) ?? []), name]);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}
