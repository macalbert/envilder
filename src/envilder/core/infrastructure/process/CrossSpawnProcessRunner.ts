import type { ChildProcess } from 'node:child_process';
import spawn from 'cross-spawn';
import {
  CommandNotExecutableError,
  CommandNotFoundError,
  CommandStartError,
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

      let spawned = false;
      child.once('spawn', () => {
        spawned = true;
      });
      // Kept attached for the child's whole life: a later 'error' with no
      // listener would crash Envilder while the child is still running.
      child.on('error', (error) => {
        if (spawned && !isSpawnFailure(error)) {
          // For example a failed signal delivery (EPERM from kill): the child
          // is still running, so keep forwarding signals and wait for it.
          return;
        }
        settle(() => reject(toSpawnError(error, request.command)));
      });
      const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
        settle(() => resolve({ code, signal }));
      };
      child.once('exit', onExit);
      child.once('close', onExit);
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
 * Whether an error reports that the command could not be started. cross-spawn
 * reports an unresolvable command on Windows after the `cmd.exe` wrapper has
 * spawned, with a `spawn <command>` syscall, so the syscall is checked rather
 * than only the moment the error arrives.
 */
function isSpawnFailure(error: unknown): boolean {
  const syscall = (error as NodeJS.ErrnoException | undefined)?.syscall;
  return typeof syscall === 'string' && syscall.startsWith('spawn');
}

/**
 * Known reasons a command exists but cannot be executed (exit code 126).
 * Any other error code gets a generic reason with the code.
 */
const NOT_EXECUTABLE_REASONS: Record<string, string> = {
  ETXTBSY: 'text file busy',
  ELOOP: 'too many levels of symbolic links',
  ENOEXEC: 'exec format error',
  EISDIR: 'is a directory',
  ENOTDIR: 'a path component is not a directory',
  ENAMETOOLONG: 'file name too long',
};
const GENERIC_NOT_EXECUTABLE_REASON = 'the operating system refused to run it';

/** The system could not provide what starting a process needs (exit 125). */
const RESOURCE_ERRORS = new Set(['EAGAIN', 'EMFILE', 'ENFILE', 'ENOMEM']);

/**
 * Maps a spawn failure to a domain error. Node throws some failures
 * synchronously and emits others on the child, so both paths use this.
 *
 * - ENOENT: the command was not found (127).
 * - E2BIG, resource exhaustion and failures without a code: Envilder could
 *   not start the command (125).
 * - EACCES and every other code: the command cannot be executed (126).
 *
 * Messages name the command only, never its arguments.
 */
function toSpawnError(error: unknown, command: string): Error {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  if (typeof code !== 'string' || code === '') {
    return new CommandStartError(command, 'the process could not be created');
  }
  if (code === 'ENOENT') {
    return new CommandNotFoundError(command);
  }
  if (code === 'E2BIG') {
    return new EnvironmentTooLargeError();
  }
  if (RESOURCE_ERRORS.has(code)) {
    return new CommandStartError(
      command,
      `system resources unavailable (${code})`,
    );
  }
  if (code === 'EACCES') {
    return new CommandNotExecutableError(command);
  }
  const reason = Object.hasOwn(NOT_EXECUTABLE_REASONS, code)
    ? NOT_EXECUTABLE_REASONS[code]
    : GENERIC_NOT_EXECUTABLE_REASON;
  return new CommandNotExecutableError(command, `${reason} (${code})`);
}
