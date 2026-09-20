/**
 * Pure domain rule describing which strings are safe to use as environment
 * variable names. Centralized here so every layer that accepts a name coming
 * from a map file or caller input (entity construction, mapping parsing,
 * `.env` writing) shares a single source of truth instead of duplicating the
 * same regex and message.
 *
 * The rule enforces one invariant: a name that is accepted must survive a
 * `.env` round-trip as itself and nothing else.
 *
 * Unsafe characters, which would inject an additional `key=value` assignment
 * or an extra line once written to a `.env` file or a mapping JSON file (see
 * issue #511):
 *
 * - `=` opens a second assignment on the same line.
 * - CR and LF open a second line.
 * - U+2028 and U+2029 are JavaScript line terminators. The `.env` writer does
 *   not split on them, but `dotenv` parses lines with a multiline regex whose
 *   `^` matches after them, so a name embedding one is read back as a
 *   separate assignment.
 *
 * Dotted and hyphenated names (historically accepted, non-POSIX) remain valid.
 */
const UNSAFE_NAME_CHARACTERS = /[=\r\n\u{2028}\u{2029}]/u;

/**
 * `__proto__` is the one name that breaks the round-trip without containing an
 * unsafe character. Writing it is fine, but every reader builds a plain object
 * and assigns into it, which routes the key through the `Object.prototype`
 * accessor instead of creating an own property -- `dotenv.parse` included, so
 * `dotenv.parse('__proto__=v')` returns `{}`. Accepting the name would mean
 * resolving the secret and writing a line that neither envilder nor any
 * dotenv-based consumer can read back, while reporting success. Rejecting it
 * up front is the only behavior that matches what actually happens.
 */
const UNSUPPORTED_NAMES = new Set(['__proto__']);

export function isValidEnvironmentVariableName(name: string): boolean {
  return (
    typeof name === 'string' &&
    name.trim() !== '' &&
    !UNSAFE_NAME_CHARACTERS.test(name) &&
    !UNSUPPORTED_NAMES.has(name)
  );
}

/**
 * Builds the rejection message for an unsafe name, so every caller reports the
 * same wording. The name is quoted rather than interpolated: it is untrusted
 * input, and quoting keeps a name carrying line terminators from breaking the
 * message across lines. Only the name is echoed, never the mapped value.
 */
export function invalidEnvironmentVariableNameMessage(name: string): string {
  if (typeof name === 'string' && name.trim() === '') {
    return 'Environment variable name cannot be empty';
  }

  if (typeof name === 'string' && UNSUPPORTED_NAMES.has(name)) {
    return (
      `Unsupported environment variable name ${quoteName(name)}: ` +
      'a .env parser cannot read this name back, so it would be written ' +
      'but never resolved'
    );
  }

  return (
    `Invalid environment variable name ${quoteName(name)}: names must not ` +
    'contain "=", carriage return, newline, or Unicode line separator ' +
    'characters'
  );
}

function quoteName(name: string): string {
  // JSON.stringify escapes CR, LF and the other control characters, but leaves
  // U+2028/U+2029 literal even though they terminate a line in JavaScript.
  return JSON.stringify(name)
    .replace(/\u{2028}/gu, '\\u2028')
    .replace(/\u{2029}/gu, '\\u2029');
}
