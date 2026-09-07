/**
 * Pure domain rule describing which strings are safe to use as environment
 * variable names. Centralized here so every layer that accepts a name coming
 * from a map file or caller input (entity construction, mapping parsing,
 * `.env` writing) shares a single source of truth instead of duplicating the
 * same regex.
 *
 * A name is unsafe when it is empty/whitespace-only, or when it contains a
 * character (`=`, CR, or LF) that would let the value inject an additional
 * `key=value` assignment or extra line when later written to a `.env` file
 * or a mapping JSON file (see issue #511). Dotted and hyphenated names
 * (historically accepted, non-POSIX) remain valid.
 */
const UNSAFE_NAME_CHARACTERS = /[=\r\n]/;

export function isValidEnvironmentVariableName(name: string): boolean {
  return (
    typeof name === 'string' &&
    name.trim() !== '' &&
    !UNSAFE_NAME_CHARACTERS.test(name)
  );
}
