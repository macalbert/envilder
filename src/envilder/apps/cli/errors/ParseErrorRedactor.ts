/**
 * An option as registered with the CLI parser.
 */
export type KnownOption = {
  /** Flags string as declared, for example `--map <path>`. */
  flags: string;
  /** Long name, for example `--map`. */
  long?: string;
  /** Whether the option is listed in `--help`; only those are suggested. */
  visible: boolean;
};

const GENERIC_ERROR = 'error: invalid command line. Run envilder --help.\n';
const GENERIC_UNKNOWN_OPTION = 'error: unknown option. Run envilder --help.\n';
const UNKNOWN_OPTION_PREFIX = "error: unknown option '";
const SAFE_LONG_NAME = /^--[A-Za-z0-9][A-Za-z0-9-]*/;
const SAFE_SHORT_NAME = /^-[A-Za-z0-9]/;
const TOO_MANY_ARGUMENTS =
  /^error: too many arguments(?: for '[A-Za-z0-9-]+')?\. Expected (\d+) (arguments?) but got (\d+)\b/;
const MISSING_ARGUMENT = /^error: option '([^\n]*)' argument missing\s*$/;

/**
 * Rebuilds a parse error from known-safe parts only (#554).
 *
 * The parser's messages quote what the user typed, and an option value, an
 * extra argument or even a mistyped option name can be a secret. Nothing
 * typed by the user is copied through unless it is provably harmless:
 *
 * - an unknown long option is named only when it is a near-typo of a visible
 *   option of the command being parsed, with that option as the suggestion;
 * - an unknown short option is named by its single character;
 * - "too many arguments" keeps only the counts;
 * - "argument missing" keeps only a registered option's own flags.
 *
 * Anything else is replaced with a generic message.
 */
export function redactParseError(
  message: string,
  knownOptions: readonly KnownOption[],
): string {
  if (message.startsWith(UNKNOWN_OPTION_PREFIX)) {
    return rebuildUnknownOption(
      message.slice(UNKNOWN_OPTION_PREFIX.length),
      knownOptions,
    );
  }

  const tooMany = TOO_MANY_ARGUMENTS.exec(message);
  if (tooMany) {
    const [, expected, noun, received] = tooMany;
    return `error: too many arguments. Expected ${expected} ${noun} but got ${received}.\n`;
  }

  const missing = MISSING_ARGUMENT.exec(message);
  if (missing && knownOptions.some((option) => option.flags === missing[1])) {
    return missingArgumentMessage(missing[1]);
  }

  return GENERIC_ERROR;
}

/**
 * The message for an option whose value is missing. Only ever built from a
 * registered option's flags.
 */
export function missingArgumentMessage(flags: string): string {
  return `error: option '${flags}' argument missing\n`;
}

function rebuildUnknownOption(
  token: string,
  knownOptions: readonly KnownOption[],
): string {
  if (!token.startsWith('--')) {
    const short = SAFE_SHORT_NAME.exec(token)?.[0];
    return short === undefined
      ? GENERIC_UNKNOWN_OPTION
      : `error: unknown option '${short}'\n`;
  }

  const name = SAFE_LONG_NAME.exec(token)?.[0];
  if (name === undefined) {
    return GENERIC_UNKNOWN_OPTION;
  }
  const candidates = knownOptions
    .filter((option) => option.visible && option.long !== undefined)
    .map((option) => option.long as string);
  const similar = suggestSimilar(name, candidates);
  if (similar.length === 0) {
    return GENERIC_UNKNOWN_OPTION;
  }
  const suggestion =
    similar.length === 1 ? similar[0] : `one of ${similar.join(', ')}`;
  return `error: unknown option '${name}' (Did you mean ${suggestion}?)\n`;
}

const MAX_DISTANCE = 3;
const MIN_SIMILARITY = 0.4;

/**
 * Same matching as Commander's own suggestions (optimal string alignment
 * distance, at most 3 edits, more than 40% similar, closest matches only),
 * applied to the safe option name because Commander offers none when the
 * typed option carries a value.
 */
function suggestSimilar(flag: string, candidates: readonly string[]): string[] {
  const word = flag.slice(2);
  let best = MAX_DISTANCE;
  let similar: string[] = [];
  for (const candidate of new Set(candidates)) {
    const name = candidate.slice(2);
    if (name.length <= 1) {
      continue;
    }
    const distance = editDistance(word, name);
    const length = Math.max(word.length, name.length);
    if ((length - distance) / length <= MIN_SIMILARITY) {
      continue;
    }
    if (distance < best) {
      best = distance;
      similar = [candidate];
    } else if (distance === best) {
      similar.push(candidate);
    }
  }
  return similar.sort((a, b) => a.localeCompare(b));
}

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > MAX_DISTANCE) {
    return Math.max(a.length, b.length);
  }
  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}
