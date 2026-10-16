const SAFE_ARGUMENT = /^[\w@%+=:,./-]+$/;

/**
 * Renders one token for display on a single line. Tokens with spaces,
 * quotes, shell metacharacters or control characters are shown JSON-quoted,
 * which reads the same on every platform and never spans lines.
 */
export function formatArgument(argument: string): string {
  return SAFE_ARGUMENT.test(argument) ? argument : JSON.stringify(argument);
}

/**
 * Renders a command for Envilder's own output: the program name only,
 * followed by an ellipsis when it has arguments. Arguments are never shown
 * because they can carry secrets (for example an `Authorization` header).
 */
export function formatProgram(
  command: string,
  args: readonly unknown[],
): string {
  const program = formatArgument(command);
  return args.length > 0 ? `${program} \u2026` : program;
}
