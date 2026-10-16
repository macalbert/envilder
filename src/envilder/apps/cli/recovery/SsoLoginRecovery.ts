import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { SsoSessionExpiredError } from '../../../core/domain/errors/DomainErrors.js';
import { presentError } from '../errors/CliErrorPresenter.js';
import { SilentExitError } from '../errors/SilentExitError.js';

const AWS_CLI_NOT_FOUND = -1;
const LOGIN_FAILED = 1;

export type RecoveryDeps = {
  isInteractive(): boolean;
  confirm(question: string): Promise<boolean>;
  runLogin(profileName?: string): Promise<number>;
  write(message: string): void;
};

export function buildLoginArgs(profileName?: string): string[] {
  if (profileName) {
    return ['sso', 'login', '--profile', profileName];
  }
  return ['sso', 'login'];
}

function defaultIsInteractive(): boolean {
  return [process.stdout.isTTY, process.stdin.isTTY].every(Boolean);
}

/**
 * Builds a yes/no prompt that writes its question to `output`. Exec mode
 * prompts on stderr so stdout stays reserved for the child process.
 */
export function createConfirm(
  output: NodeJS.WritableStream,
): (question: string) => Promise<boolean> {
  return (question) => {
    const prompt = createInterface({ input: process.stdin, output });
    return new Promise((resolve) => {
      prompt.question(`${question} `, (answer) => {
        prompt.close();
        resolve(answer.trim().toLowerCase() === 'y');
      });
    });
  };
}

function defaultConfirm(question: string): Promise<boolean> {
  return createConfirm(process.stdout)(question);
}

const STDERR_FD = 2;

/**
 * Builds the `aws sso login` runner. With `stdout: 'stderr'` the login's
 * output goes to stderr, so stdout stays reserved for an exec child; the
 * default inherits every stream.
 */
export function createRunLogin(
  options: { stdout?: 'inherit' | 'stderr' } = {},
): (profileName?: string) => Promise<number> {
  const stdio =
    options.stdout === 'stderr'
      ? (['inherit', STDERR_FD, 'inherit'] as const)
      : ('inherit' as const);
  return (profileName) =>
    new Promise((resolve) => {
      const child = spawn('aws', buildLoginArgs(profileName), {
        stdio: stdio === 'inherit' ? stdio : [...stdio],
      });
      child.on('error', (error: NodeJS.ErrnoException) => {
        resolve(error.code === 'ENOENT' ? AWS_CLI_NOT_FOUND : LOGIN_FAILED);
      });
      child.on('close', (code) => {
        resolve(code ?? LOGIN_FAILED);
      });
    });
}

const defaultRunLogin = createRunLogin();

function defaultWrite(message: string): void {
  console.error(message);
}

const defaultDeps: RecoveryDeps = {
  isInteractive: defaultIsInteractive,
  confirm: defaultConfirm,
  runLogin: defaultRunLogin,
  write: defaultWrite,
};

export async function executeWithSsoRecovery(
  run: () => Promise<void>,
  deps: Partial<RecoveryDeps> = {},
): Promise<void> {
  const resolved: RecoveryDeps = { ...defaultDeps, ...deps };
  try {
    return await run();
  } catch (error) {
    if (!(error instanceof SsoSessionExpiredError)) {
      throw error;
    }
    if (!resolved.isInteractive()) {
      throw error;
    }
    await recoverInteractively(run, error, resolved);
  }
}

async function recoverInteractively(
  run: () => Promise<void>,
  error: SsoSessionExpiredError,
  deps: RecoveryDeps,
): Promise<void> {
  deps.write(presentError(error));

  const command = error.profileName
    ? `aws sso login --profile ${error.profileName}`
    : 'aws sso login';
  const accepted = await deps.confirm(`Run '${command}' now? [y/N]`);
  if (!accepted) {
    deps.write(
      'Skipped. Run the command above when ready, then re-run envilder.',
    );
    throw new SilentExitError(LOGIN_FAILED);
  }

  const exitCode = await deps.runLogin(error.profileName);
  ensureLoginSucceeded(exitCode, deps);
  await retryOnce(run, deps);
}

function ensureLoginSucceeded(exitCode: number, deps: RecoveryDeps): void {
  if (exitCode === AWS_CLI_NOT_FOUND) {
    deps.write(
      'The AWS CLI was not found on your PATH. Install it, then run the command above.',
    );
    throw new SilentExitError(LOGIN_FAILED);
  }
  if (exitCode !== 0) {
    deps.write('Login did not complete. Try again, then re-run envilder.');
    throw new SilentExitError(LOGIN_FAILED);
  }
}

async function retryOnce(
  run: () => Promise<void>,
  deps: RecoveryDeps,
): Promise<void> {
  deps.write('\uD83C\uDF44 1-UP! SSO session restored.');
  deps.write('\u21bb Warping back for your secrets\u2026');
  try {
    await run();
    deps.write('\u2b50 Level cleared.');
  } catch (retryError) {
    if (retryError instanceof SsoSessionExpiredError) {
      deps.write(presentError(retryError));
      throw new SilentExitError(LOGIN_FAILED);
    }
    throw retryError;
  }
}
