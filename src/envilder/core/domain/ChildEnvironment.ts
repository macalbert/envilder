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

  const env: Record<string, string> = {};
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
