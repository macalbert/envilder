/**
 * Pure domain rule describing which strings are usable as environment variable
 * names. Centralized here so every layer that accepts a name coming from a map
 * file or caller input (entity construction, mapping parsing, `.env` writing)
 * shares a single source of truth instead of duplicating the same regex and
 * message.
 *
 * The rule enforces one invariant: **an accepted name must survive a `.env`
 * round-trip as itself and nothing else.**
 *
 * That is expressed as an allowlist rather than a list of banned characters,
 * because a blocklist cannot hold the invariant. `.env` readers recognize a
 * key as `[A-Za-z0-9_.-]+`; anything outside that either makes the line
 * unparseable, so the variable is written and then silently lost (a space,
 * `#`, a tab, an accented or non-Latin letter, NUL, vertical tab), or is read
 * back as a *different* assignment, which is the injection in issue #511:
 *
 * - `=` opens a second assignment on the same line.
 * - CR and LF open a second line.
 * - U+2028 and U+2029 are JavaScript line terminators. The `.env` writer does
 *   not split on them, but `dotenv` parses lines with a multiline regex whose
 *   `^` matches after them, so a name embedding one is read back as a
 *   separate assignment.
 *
 * Dotted and hyphenated names (historically accepted, non-POSIX) stay valid:
 * they are inside the allowlist and do round-trip.
 */
const READABLE_NAME = /^[A-Za-z0-9_.-]+$/;

/**
 * `__proto__` is the one name inside the allowlist that still breaks the
 * round-trip. Writing it is fine, but every reader builds a plain object and
 * assigns into it, which routes the key through the `Object.prototype`
 * accessor instead of creating an own property -- `dotenv.parse` included, so
 * `dotenv.parse('__proto__=v')` returns `{}`. Accepting the name would mean
 * resolving the secret and writing a line that neither envilder nor any
 * dotenv-based consumer can read back, while reporting success.
 */
const UNSUPPORTED_NAMES = new Set(['__proto__']);

export function isValidEnvironmentVariableName(name: string): boolean {
  return (
    typeof name === 'string' &&
    READABLE_NAME.test(name) &&
    !UNSUPPORTED_NAMES.has(name)
  );
}

/**
 * Builds the rejection message, so every caller reports the same wording. The
 * name is quoted rather than interpolated: it is untrusted input, and quoting
 * keeps a name carrying line terminators from breaking the message across
 * lines. Only the name is echoed, never the mapped value.
 */
export function invalidEnvironmentVariableNameMessage(name: string): string {
  if (typeof name !== 'string' || name.trim() === '') {
    return 'Environment variable name cannot be empty';
  }

  if (UNSUPPORTED_NAMES.has(name)) {
    return (
      `Unsupported environment variable name ${quoteName(name)}: ` +
      'a .env parser cannot read this name back, so it would be written ' +
      'but never resolved'
    );
  }

  return (
    `Invalid environment variable name ${quoteName(name)}: names may only ` +
    'contain letters, digits, underscore, dot and hyphen, so that they can ' +
    'be read back from a .env file'
  );
}

function quoteName(name: string): string {
  // JSON.stringify escapes CR, LF and the other control characters, but leaves
  // U+2028/U+2029 literal even though they terminate a line in JavaScript.
  return JSON.stringify(name)
    .replace(/\u{2028}/gu, '\\u2028')
    .replace(/\u{2029}/gu, '\\u2029');
}
