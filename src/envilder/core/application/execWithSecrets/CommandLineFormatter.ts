const SAFE_ARGUMENT = /^[\w@%+=:,./-]+$/;

/**
 * Renders one argument for display on a single line. Arguments with spaces,
 * quotes, shell metacharacters or control characters are shown JSON-quoted,
 * which reads the same on every platform and never spans lines.
 */
export function formatArgument(argument: string): string {
  return SAFE_ARGUMENT.test(argument) ? argument : JSON.stringify(argument);
}

/**
 * Renders a command and its arguments for display on a single line.
 */
export function formatCommandLine(parts: readonly string[]): string {
  return parts.map(formatArgument).join(' ');
}
