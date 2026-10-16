import type { ProcessExit } from './ports/IProcessRunner.js';

/**
 * Exit codes used by exec mode. They follow GNU `env` and `docker run`, so a
 * caller can tell an Envilder failure apart from the child's own exit code.
 */
export const EXEC_ENVILDER_FAILURE = 125;
export const EXEC_COMMAND_NOT_EXECUTABLE = 126;
export const EXEC_COMMAND_NOT_FOUND = 127;

const SIGNAL_EXIT_BASE = 128;
const UNKNOWN_CHILD_FAILURE = 1;

/**
 * Translates how the child ended into the exit code Envilder must return:
 * the child's own code, or `128 + n` when it was killed by signal `n`.
 */
export function exitCodeForChild(
  exit: ProcessExit,
  signalNumber: (signal: NodeJS.Signals) => number,
): number {
  if (exit.code !== null) {
    return exit.code;
  }
  if (exit.signal !== null) {
    return SIGNAL_EXIT_BASE + signalNumber(exit.signal);
  }
  return UNKNOWN_CHILD_FAILURE;
}
