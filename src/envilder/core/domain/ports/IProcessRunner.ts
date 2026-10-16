/**
 * A request to start a child process.
 *
 * `env` is the complete environment of the child: adapters must pass it
 * exclusively and never merge it with the parent environment on their own.
 */
export type ProcessRequest = {
  command: string;
  args: string[];
  env: Record<string, string>;
};

/**
 * How a child process ended: an exit code, or the signal that killed it.
 */
export type ProcessExit = {
  code: number | null;
  signal: NodeJS.Signals | null;
};

export interface IProcessRunner {
  /**
   * Starts the command, waits for it to exit and reports how it ended.
   * Rejects with `CommandNotFoundError` or `CommandNotExecutableError` when
   * the command cannot be started.
   */
  run(request: ProcessRequest): Promise<ProcessExit>;
}
