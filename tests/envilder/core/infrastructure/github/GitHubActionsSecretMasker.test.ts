import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GitHubActionsSecretMasker } from '../../../../../src/envilder/core/infrastructure/github/GitHubActionsSecretMasker';

const MASKED_VALUE_COUNT = 128;
const MASKED_VALUE_SIZE = 8 * 1024;
const PARENT_READ_DELAY_MS = 1_500;
const GRANDCHILD_MARKER = 'GRANDCHILD_MARKER';

/**
 * Child process that registers many large masks, awaits flush, then starts a
 * grandchild sharing its stdout. On POSIX, stdout pipe writes are
 * asynchronous, so without a real flush the grandchild can overtake the masks.
 */
function maskerChildScript(): string {
  const maskerUrl = pathToFileURL(
    resolve(
      'src/envilder/core/infrastructure/github/GitHubActionsSecretMasker.ts',
    ),
  ).href;
  const grandchildScript = `console.log(${JSON.stringify(GRANDCHILD_MARKER)})`;
  return [
    "import { spawn } from 'node:child_process';",
    `import { GitHubActionsSecretMasker } from ${JSON.stringify(maskerUrl)};`,
    'const masker = new GitHubActionsSecretMasker();',
    `for (let i = 0; i < ${MASKED_VALUE_COUNT}; i++) {`,
    `  masker.mask('value-' + i + '-' + 'x'.repeat(${MASKED_VALUE_SIZE}));`,
    '}',
    'await masker.flush();',
    `const child = spawn(process.execPath, ['-e', ${JSON.stringify(grandchildScript)}], { stdio: 'inherit' });`,
    "child.on('close', (code) => process.exit(code ?? 1));",
  ].join('\n');
}

function runWithSlowReader(
  scriptPath: string,
): Promise<{ code: number | null; lines: string[] }> {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, ['--import', 'tsx', scriptPath], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let output = '';
    child.stdout.pause();
    setTimeout(() => {
      child.stdout.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.stdout.resume();
    }, PARENT_READ_DELAY_MS);
    child.on('close', (code) => {
      resolvePromise({ code, lines: output.split(/\r?\n/) });
    });
  });
}

describe('GitHubActionsSecretMasker', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Should_EmitEscapedMaskCommand_When_SecretIsRegistered', () => {
    // Arrange
    const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    const sut = new GitHubActionsSecretMasker();

    // Act
    sut.mask('secret%value\r\nnext');

    // Assert
    expect(write).toHaveBeenCalledTimes(1);
    expect(String(write.mock.calls[0][0])).toBe(
      '::add-mask::secret%25value%0D%0Anext\n',
    );
  });

  it('Should_ResolveFlush_When_RegistrationsWereWritten', async () => {
    // Arrange
    vi.spyOn(process.stdout, 'write').mockImplementation(((
      ...args: unknown[]
    ) => {
      const callback = args.find(
        (arg): arg is (error?: Error | null) => void =>
          typeof arg === 'function',
      );
      callback?.();
      return true;
    }) as typeof process.stdout.write);
    const sut = new GitHubActionsSecretMasker();
    sut.mask('registered-value');

    // Act
    const actual = sut.flush();

    // Assert
    await expect(actual).resolves.toBeUndefined();
  });

  it('Should_RejectFlush_When_WriteCallbackReportsError', async () => {
    // Arrange
    const writeError = Object.assign(new Error('write EPIPE'), {
      code: 'EPIPE',
    });
    vi.spyOn(process.stdout, 'write').mockImplementation(((
      ...args: unknown[]
    ) => {
      const callback = args.find(
        (arg): arg is (error?: Error | null) => void =>
          typeof arg === 'function',
      );
      process.nextTick(() => callback?.(writeError));
      return true;
    }) as typeof process.stdout.write);
    const sut = new GitHubActionsSecretMasker();
    sut.mask('registered-value');

    // Act
    const actual = sut.flush();

    // Assert
    await expect(actual).rejects.toBe(writeError);
  });

  it('Should_RejectFlushWithFirstError_When_SeveralWritesFail', async () => {
    // Arrange
    const errors = [new Error('E1'), new Error('E2')];
    let writeIndex = 0;
    vi.spyOn(process.stdout, 'write').mockImplementation(((
      ...args: unknown[]
    ) => {
      const callback = args.find(
        (arg): arg is (error?: Error | null) => void =>
          typeof arg === 'function',
      );
      const error = errors[writeIndex];
      writeIndex += 1;
      process.nextTick(() => callback?.(error));
      return true;
    }) as typeof process.stdout.write);
    const sut = new GitHubActionsSecretMasker();
    sut.mask('first-value');
    sut.mask('second-value');

    // Act
    const actual = sut.flush();

    // Assert
    await expect(actual).rejects.toBe(errors[0]);
  });

  it('Should_RejectFlush_When_SecondWriteFails', async () => {
    // Arrange
    const secondError = new Error('second write failed');
    const outcomes: Array<Error | null> = [null, secondError];
    let writeIndex = 0;
    vi.spyOn(process.stdout, 'write').mockImplementation(((
      ...args: unknown[]
    ) => {
      const callback = args.find(
        (arg): arg is (error?: Error | null) => void =>
          typeof arg === 'function',
      );
      const outcome = outcomes[writeIndex];
      writeIndex += 1;
      process.nextTick(() => callback?.(outcome));
      return true;
    }) as typeof process.stdout.write);
    const sut = new GitHubActionsSecretMasker();
    sut.mask('first-value');
    sut.mask('second-value');

    // Act
    const actual = sut.flush();

    // Assert
    await expect(actual).rejects.toBe(secondError);
  });

  it('Should_ResolveFlushOnlyAfterWriteCallback_When_CallbackIsAsynchronous', async () => {
    // Arrange
    const callbacks: Array<(error?: Error | null) => void> = [];
    vi.spyOn(process.stdout, 'write').mockImplementation(((
      ...args: unknown[]
    ) => {
      const callback = args.find(
        (arg): arg is (error?: Error | null) => void =>
          typeof arg === 'function',
      );
      callbacks.push(callback ?? (() => undefined));
      return true;
    }) as typeof process.stdout.write);
    const sut = new GitHubActionsSecretMasker();
    sut.mask('first-value');
    sut.mask('second-value');
    let settled = false;

    // Act
    const flushing = sut.flush().then(() => {
      settled = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    const settledBeforeCallbacks = settled;
    for (const callback of callbacks) {
      callback(null);
    }
    await flushing;

    // Assert
    expect(settledBeforeCallbacks).toBe(false);
    expect(callbacks).toHaveLength(2);
    expect(settled).toBe(true);
  });

  describe('stderr destination', () => {
    function callbackOf(args: unknown[]): (error?: Error | null) => void {
      return (
        args.find(
          (arg): arg is (error?: Error | null) => void =>
            typeof arg === 'function',
        ) ?? (() => undefined)
      );
    }

    it('Should_WriteRegistrationToStderr_When_StreamIsStderr', () => {
      // Arrange
      const stdoutWrite = vi
        .spyOn(process.stdout, 'write')
        .mockReturnValue(true);
      const stderrWrite = vi
        .spyOn(process.stderr, 'write')
        .mockReturnValue(true);
      const sut = new GitHubActionsSecretMasker({ stream: process.stderr });

      // Act
      sut.mask('secret%value\r\nnext');

      // Assert
      expect(stdoutWrite).not.toHaveBeenCalled();
      expect(stderrWrite).toHaveBeenCalledTimes(1);
      expect(String(stderrWrite.mock.calls[0][0])).toBe(
        '::add-mask::secret%25value%0D%0Anext\n',
      );
    });

    it('Should_ResolveFlushOnlyAfterStderrWriteCallback_When_StreamIsStderr', async () => {
      // Arrange
      const callbacks: Array<(error?: Error | null) => void> = [];
      vi.spyOn(process.stdout, 'write').mockImplementation(((
        ...args: unknown[]
      ) => {
        const callback = callbackOf(args);
        process.nextTick(() => callback(null));
        return true;
      }) as typeof process.stdout.write);
      vi.spyOn(process.stderr, 'write').mockImplementation(((
        ...args: unknown[]
      ) => {
        callbacks.push(callbackOf(args));
        return true;
      }) as typeof process.stderr.write);
      const sut = new GitHubActionsSecretMasker({ stream: process.stderr });
      sut.mask('first-value');
      sut.mask('second-value');
      let settled = false;

      // Act
      const flushing = sut.flush().then(() => {
        settled = true;
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
      const settledBeforeCallbacks = settled;
      for (const callback of callbacks) {
        callback(null);
      }
      await flushing;

      // Assert
      expect(settledBeforeCallbacks).toBe(false);
      expect(callbacks).toHaveLength(2);
      expect(settled).toBe(true);
    });

    it('Should_RejectFlush_When_StderrWriteFails', async () => {
      // Arrange
      const writeError = Object.assign(new Error('write EPIPE'), {
        code: 'EPIPE',
      });
      vi.spyOn(process.stdout, 'write').mockImplementation(((
        ...args: unknown[]
      ) => {
        const callback = callbackOf(args);
        process.nextTick(() => callback(null));
        return true;
      }) as typeof process.stdout.write);
      vi.spyOn(process.stderr, 'write').mockImplementation(((
        ...args: unknown[]
      ) => {
        const callback = callbackOf(args);
        process.nextTick(() => callback(writeError));
        return true;
      }) as typeof process.stderr.write);
      const sut = new GitHubActionsSecretMasker({ stream: process.stderr });
      sut.mask('registered-value');

      // Act
      const actual = sut.flush();

      // Assert
      await expect(actual).rejects.toBe(writeError);
    });
  });

  // Pipe writes are synchronous on Windows, so this ordering check can only
  // catch a regression on POSIX, where stdout pipe writes are asynchronous.
  it('Should_DeliverEveryMaskBeforeChildOutput_When_StdoutPipeIsBackpressured', async () => {
    // Arrange
    const workDir = await mkdtemp(join(tmpdir(), 'envilder-masker-flush-'));
    const scriptPath = join(workDir, 'masker-child.mts');
    await writeFile(scriptPath, maskerChildScript());

    // Act
    const actual = await runWithSlowReader(scriptPath).finally(() =>
      rm(workDir, { recursive: true, force: true }),
    );

    // Assert
    const markerIndex = actual.lines.indexOf(GRANDCHILD_MARKER);
    const maskIndexes = actual.lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.startsWith('::add-mask::'))
      .map(({ index }) => index);
    expect(actual.code).toBe(0);
    expect(markerIndex).toBeGreaterThan(-1);
    expect(maskIndexes).toHaveLength(MASKED_VALUE_COUNT);
    expect(Math.max(...maskIndexes)).toBeLessThan(markerIndex);
  }, 30_000);
});
