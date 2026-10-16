/**
 * An option as registered with the CLI parser.
 */
export type KnownOption = {
  /** Flags string as declared, for example `--map <path>`. */
  flags: string;
  /** Long name, for example `--map`. */
  long?: string;
};

const GENERIC_ERROR = 'error: invalid command line. Run envilder --help.\n';
const GENERIC_UNKNOWN_OPTION = 'error: unknown option. Run envilder --help.\n';
const UNKNOWN_OPTION_PREFIX = "error: unknown option '";
const SAFE_LONG_NAME = /^--[A-Za-z0-9][A-Za-z0-9-]*/;
const SAFE_SHORT_NAME = /^-[A-Za-z0-9]/;
const SUGGESTION = /\(Did you mean (--[A-Za-z0-9-]+)\?\)\s*$/;
const TOO_MANY_ARGUMENTS =
  /^error: too many arguments(?: for '[A-Za-z0-9-]+')?\. Expected (\d+) (arguments?) but got (\d+)\b/;
const MISSING_ARGUMENT = /^error: option '([^\n]*)' argument missing\s*$/;

/**
 * Rebuilds a parse error from known-safe parts only (#554).
 *
 * The parser's messages quote what the user typed, and an option value or an
 * extra argument can be a secret. Nothing typed by the user is ever copied
 * through: the output is rebuilt from strictly matched pieces (a safe option
 * name, counts, or a registered option's flags), and anything else is
 * replaced with a generic message.
 */
export function redactParseError(
  message: string,
  knownOptions: readonly KnownOption[],
): string {
  if (message.startsWith(UNKNOWN_OPTION_PREFIX)) {
    return rebuildUnknownOption(message, knownOptions);
  }

  const tooMany = TOO_MANY_ARGUMENTS.exec(message);
  if (tooMany) {
    const [, expected, noun, received] = tooMany;
    return `error: too many arguments. Expected ${expected} ${noun} but got ${received}.\n`;
  }

  const missing = MISSING_ARGUMENT.exec(message);
  if (missing && knownOptions.some((option) => option.flags === missing[1])) {
    return `error: option '${missing[1]}' argument missing\n`;
  }

  return GENERIC_ERROR;
}

function rebuildUnknownOption(
  message: string,
  knownOptions: readonly KnownOption[],
): string {
  const token = message.slice(UNKNOWN_OPTION_PREFIX.length);
  const name = token.startsWith('--')
    ? SAFE_LONG_NAME.exec(token)?.[0]
    : SAFE_SHORT_NAME.exec(token)?.[0];
  if (name === undefined) {
    return GENERIC_UNKNOWN_OPTION;
  }

  const suggested = SUGGESTION.exec(message)?.[1];
  const isKnown = knownOptions.some((option) => option.long === suggested);
  const suggestion =
    suggested !== undefined && isKnown ? ` (Did you mean ${suggested}?)` : '';
  return `error: unknown option '${name}'${suggestion}\n`;
}
