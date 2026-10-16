import type { ChildProcess } from 'node:child_process';
import spawn from 'cross-spawn';
import {
  CommandNotExecutableError,
  CommandNotFoundError,
  EnvironmentTooLargeError,
} from '../../domain/errors/DomainErrors.js';
import type {
  IProcessRunner,
  ProcessExit,
  ProcessRequest,
} from '../../domain/ports/IProcessRunner.js';

const FORWARDED_SIGNALS = ['SIGTERM', 'SIGHUP'] as const;

/**
 * Starts a child process with `cross-spawn`: argv-based, no shell, and with
 * Windows `.cmd`/`.bat` shims (npm, npx) resolved safely.
 *
 * While the child runs, termination signals received by Envilder are
 * forwarded to it and Envilder waits for it to exit, with no timeout of its
 * own: escalation belongs to the process manager. `SIGINT` is not forwarded
 * when attached to a terminal, because the terminal already delivers it to
 * the whole process group; Envilder only stays alive until the child exits.
 */
export class CrossSpawnProcessRunner implements IProcessRunner {
  run(request: ProcessRequest): Promise<ProcessExit> {
    return new Promise((resolve, reject) => {
      let child: ChildProcess;
      try {
        child = spawn(request.command, request.args, {
          env: request.env,
          stdio: 'inherit',
          shell: false,
        });
      } catch (error) {
        reject(toSpawnError(error, request.command));
        return;
      }

      const removeSignalForwarding = forwardSignals(child);
      let settled = false;
      const settle = (finish: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        removeSignalForwarding();
        finish();
      };

      child.once('error', (error) => {
        settle(() => reject(toSpawnError(error, request.command)));
      });
      child.once('exit', (code, signal) => {
        settle(() => resolve({ code, signal }));
      });
    });
  }
}

function forwardSignals(child: ChildProcess): () => void {
  const listeners = new Map<NodeJS.Signals, () => void>();
  const forward = (signal: NodeJS.Signals) => () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal);
    }
  };

  for (const signal of FORWARDED_SIGNALS) {
    listeners.set(signal, forward(signal));
  }
  // Listening to SIGINT also keeps Envilder alive until the child exits.
  const forwardInterrupt = forward('SIGINT');
  listeners.set('SIGINT', () => {
    if (!process.stdin.isTTY) {
      forwardInterrupt();
    }
  });

  for (const [signal, listener] of listeners) {
    process.on(signal, listener);
  }
  return () => {
    for (const [signal, listener] of listeners) {
      process.removeListener(signal, listener);
    }
  };
}

/**
 * Reasons a command exists but cannot be executed, reported with exit code
 * 126. EACCES keeps the familiar `Permission denied: <command>` message.
 */
const NOT_EXECUTABLE_REASONS: Record<string, string> = {
  ETXTBSY: 'text file busy (ETXTBSY)',
  ELOOP: 'too many levels of symbolic links (ELOOP)',
  ENOEXEC: 'exec format error (ENOEXEC)',
  EISDIR: 'is a directory (EISDIR)',
  ENOTDIR: 'a path component is not a directory (ENOTDIR)',
};

/**
 * Maps a spawn failure to a domain error. Node throws some failures
 * synchronously and emits others on the child, so both paths use this.
 */
function toSpawnError(error: unknown, command: string): unknown {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  if (code === 'ENOENT') {
    return new CommandNotFoundError(command);
  }
  if (code === 'EACCES') {
    return new CommandNotExecutableError(command);
  }
  if (code === 'E2BIG') {
    return new EnvironmentTooLargeError();
  }
  if (code !== undefined && Object.hasOwn(NOT_EXECUTABLE_REASONS, code)) {
    return new CommandNotExecutableError(command, NOT_EXECUTABLE_REASONS[code]);
  }
  return error;
}
