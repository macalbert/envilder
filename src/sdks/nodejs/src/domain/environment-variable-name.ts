/**
 * Which strings are usable as environment variable names, per the map-file
 * naming constraint in ADR-0008: an accepted name must survive a `.env`
 * round-trip as itself and nothing else. `^[A-Za-z0-9_.-]+$` is exactly the
 * key grammar `.env` parsers recognize, so anything outside it is either read
 * back as a different assignment (`=`, CR, LF, U+2028, U+2029) or silently
 * lost (a space, `#`, a tab, a non-Latin letter).
 *
 * `__proto__` is inside the allowlist but every reader that accumulates pairs
 * into a plain object drops it, so it is rejected as well.
 */
const READABLE_NAME = /^[A-Za-z0-9_.-]+$/;

const UNSUPPORTED_NAMES = new Set(['__proto__']);

export function isValidEnvironmentVariableName(name: string): boolean {
  return READABLE_NAME.test(name) && !UNSUPPORTED_NAMES.has(name);
}

/**
 * Builds the rejection message. The name is untrusted input, so it is quoted
 * rather than interpolated: a name carrying line terminators cannot break the
 * message across lines. Only the name is echoed, never the mapped value.
 */
export function invalidEnvironmentVariableNameMessage(name: string): string {
  if (name.trim() === '') {
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
