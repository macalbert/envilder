import type { ILogger } from '../../domain/ports/ILogger.js';

/**
 * Logger for the GitHub Actions runner, which reads every output line as a
 * possible workflow command. Messages can carry input-derived text (file
 * names, secret references), so each one is written as a single inert line:
 * otherwise a value such as `x\n::stop-commands::t` would switch off command
 * processing before the `::add-mask::` registrations that follow.
 */
export class GitHubActionsLogger implements ILogger {
  constructor(private readonly inner: ILogger) {}

  info(message: string): void {
    this.inner.info(toInertLine(message));
  }

  warn(message: string): void {
    this.inner.warn(toInertLine(message));
  }

  error(message: string): void {
    this.inner.error(toInertLine(message));
  }
}

function toInertLine(message: string): string {
  return (
    message
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      // Legacy `##[command]` syntax is recognized anywhere in a line.
      .replace(/##\[/g, '#\\#[')
      // `::command::` is recognized at the start, after whitespace as .NET
      // TrimStart sees it, which also includes NEL (U+0085).
      .replace(/^([\s\u0085]*)::/, '$1\\::')
  );
}
