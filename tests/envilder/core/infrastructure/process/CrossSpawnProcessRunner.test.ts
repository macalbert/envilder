import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommandNotExecutableError,
  CommandNotFoundError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { CrossSpawnProcessRunner } from '../../../../../src/envilder/core/infrastructure/process/CrossSpawnProcessRunner';

const isWindows = process.platform === 'win32';
const CHILD_SELF_EXIT_MS = 5_000;

function parentEnvironment(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
}

async function waitForFile(path: string, timeoutMs = 5_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!existsSync(path) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

describe('CrossSpawnProcessRunner', () => {
  let workDir: string;
  let sut: CrossSpawnProcessRunner;

  beforeEach(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'envilder-exec-runner-'));
    sut = new CrossSpawnProcessRunner();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(workDir, { recursive: true, force: true });
  });

  it('Should_StartChildWithResolvedSecrets_When_EnvIsProvided', async () => {
    // Arrange
    const outFile = join(workDir, 'env.json');
    const pem =
      '-----BEGIN FAKE TEST BLOCK-----\nMIIEvQIBADANBg\r\nkqhkiG9w0BAQEF\n-----END FAKE TEST BLOCK-----\n';
    const special = `a=b "q" 'q' #hash $DB_URL ñ 日本`;
    const env = {
      ...parentEnvironment(),
      EXEC_PEM_KEY: pem,
      EXEC_SPECIAL: special,
    };
    const script = `require('fs').writeFileSync(process.argv[1], JSON.stringify({ pem: process.env.EXEC_PEM_KEY, special: process.env.EXEC_SPECIAL }))`;

    // Act
    const actual = await sut.run({
      command: process.execPath,
      args: ['-e', script, outFile],
      env,
    });

    // Assert
    expect(actual).toEqual({ code: 0, signal: null });
    expect(JSON.parse(readFileSync(outFile, 'utf8'))).toEqual({
      pem,
      special,
    });
  });

  it('Should_UseOnlyProvidedEnvironment_When_ChildStarts', async () => {
    // Arrange
    const outFile = join(workDir, 'env.json');
    const env = parentEnvironment();
    vi.stubEnv('ENVILDER_EXEC_PARENT_ONLY', 'must-not-leak');
    const script = `require('fs').writeFileSync(process.argv[1], JSON.stringify({ leaked: process.env.ENVILDER_EXEC_PARENT_ONLY ?? null }))`;

    // Act
    await sut.run({
      command: process.execPath,
      args: ['-e', script, outFile],
      env,
    });

    // Assert
    expect(JSON.parse(readFileSync(outFile, 'utf8'))).toEqual({
      leaked: null,
    });
  });

  it('Should_PassArgumentsVerbatim_When_CommandHasArguments', async () => {
    // Arrange
    const outFile = join(workDir, 'args.json');
    const childArgs = [
      '--map',
      'foo',
      '$DB_URL',
      'a b',
      '"double"',
      "'single'",
      '%PATH%',
      '&& echo injected',
    ];
    const script = `require('fs').writeFileSync(process.argv[1], JSON.stringify(process.argv.slice(2)))`;

    // Act
    await sut.run({
      command: process.execPath,
      args: ['-e', script, outFile, ...childArgs],
      env: parentEnvironment(),
    });

    // Assert
    expect(JSON.parse(readFileSync(outFile, 'utf8'))).toEqual(childArgs);
  });

  it('Should_PropagateChildExitCode_When_ChildExits', async () => {
    // Act
    const actual = await sut.run({
      command: process.execPath,
      args: ['-e', 'process.exit(3)'],
      env: parentEnvironment(),
    });

    // Assert
    expect(actual).toEqual({ code: 3, signal: null });
  });

  it.runIf(isWindows)(
    'Should_ResolveWindowsShim_When_CommandIsCmdFile',
    async () => {
      // Arrange
      const outFile = join(workDir, 'shim-args.json');
      const writerPath = join(workDir, 'writer.js');
      const shimPath = join(workDir, 'tool.cmd');
      await writeFile(
        writerPath,
        "require('fs').writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3))); process.exit(6);",
      );
      await writeFile(
        shimPath,
        `@"${process.execPath}" "%~dp0writer.js" %*
@exit /b %ERRORLEVEL%
`,
      );

      // Act
      const actual = await sut.run({
        command: shimPath,
        args: [outFile, 'a b', '$DB_URL', 'plain'],
        env: parentEnvironment(),
      });

      // Assert
      expect(actual).toEqual({ code: 6, signal: null });
      expect(JSON.parse(readFileSync(outFile, 'utf8'))).toEqual([
        'a b',
        '$DB_URL',
        'plain',
      ]);
    },
  );

  it('Should_ResolveNpmShim_When_CommandIsNpm', async () => {
    // Act
    const actual = await sut.run({
      command: 'npm',
      args: ['--version'],
      env: parentEnvironment(),
    });

    // Assert
    expect(actual).toEqual({ code: 0, signal: null });
  }, 30_000);

  it('Should_ExitWith127_When_CommandIsNotFound', async () => {
    // Arrange
    const command = 'envilder-nonexistent-cmd-7f3a9c';

    // Act
    const actual = await sut
      .run({ command, args: [], env: parentEnvironment() })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(CommandNotFoundError);
    expect((actual as Error).message).toContain(command);
  });

  it.skipIf(isWindows)(
    'Should_ExitWith126_When_CommandIsNotExecutable',
    async () => {
      // Arrange
      const scriptPath = join(workDir, 'script.sh');
      await writeFile(scriptPath, '#!/bin/sh\nexit 0\n', { mode: 0o644 });

      // Act
      const actual = await sut
        .run({ command: scriptPath, args: [], env: parentEnvironment() })
        .catch((error: unknown) => error);

      // Assert
      expect(actual).toBeInstanceOf(CommandNotExecutableError);
      expect((actual as Error).message).toContain(scriptPath);
    },
  );

  it.skipIf(isWindows)(
    'Should_ExitWith128PlusSignal_When_ChildIsKilledBySignal',
    async () => {
      // Act
      const actual = await sut.run({
        command: process.execPath,
        args: ['-e', "process.kill(process.pid, 'SIGKILL')"],
        env: parentEnvironment(),
      });

      // Assert
      expect(actual).toEqual({ code: null, signal: 'SIGKILL' });
    },
  );

  it.skipIf(isWindows)(
    'Should_ForwardTerminationSignal_When_ParentReceivesSigterm',
    async () => {
      // Arrange
      const readyFile = join(workDir, 'ready');
      const script = `require('fs').writeFileSync(process.argv[1], 'ready'); setTimeout(() => process.exit(99), ${CHILD_SELF_EXIT_MS})`;
      const running = sut.run({
        command: process.execPath,
        args: ['-e', script, readyFile],
        env: parentEnvironment(),
      });
      await waitForFile(readyFile);

      // Act
      process.emit('SIGTERM', 'SIGTERM');

      // Assert
      await expect(running).resolves.toEqual({
        code: null,
        signal: 'SIGTERM',
      });
    },
    15_000,
  );

  it.skipIf(isWindows)(
    'Should_ForwardHangupSignal_When_ParentReceivesSighup',
    async () => {
      // Arrange
      const readyFile = join(workDir, 'ready');
      const script = `require('fs').writeFileSync(process.argv[1], 'ready'); setTimeout(() => process.exit(99), ${CHILD_SELF_EXIT_MS})`;
      const running = sut.run({
        command: process.execPath,
        args: ['-e', script, readyFile],
        env: parentEnvironment(),
      });
      await waitForFile(readyFile);

      // Act
      process.emit('SIGHUP', 'SIGHUP');

      // Assert
      await expect(running).resolves.toEqual({
        code: null,
        signal: 'SIGHUP',
      });
    },
    15_000,
  );

  it.skipIf(isWindows)(
    'Should_WaitForChildWithoutTimeout_When_SigtermIsForwarded',
    async () => {
      // Arrange
      const readyFile = join(workDir, 'ready');
      const doneFile = join(workDir, 'graceful-shutdown-done');
      const script = [
        `const fs = require('fs');`,
        `process.on('SIGTERM', () => setTimeout(() => { fs.writeFileSync(process.argv[2], 'done'); process.exit(7); }, 1500));`,
        `fs.writeFileSync(process.argv[1], 'ready');`,
        `setTimeout(() => process.exit(99), ${CHILD_SELF_EXIT_MS});`,
      ].join(' ');
      const running = sut.run({
        command: process.execPath,
        args: ['-e', script, readyFile, doneFile],
        env: parentEnvironment(),
      });
      await waitForFile(readyFile);

      // Act
      process.emit('SIGTERM', 'SIGTERM');
      const actual = await running;

      // Assert
      expect(actual).toEqual({ code: 7, signal: null });
      expect(existsSync(doneFile)).toBe(true);
    },
    15_000,
  );

  describe('SIGINT policy', () => {
    const originalStdinIsTTY = process.stdin.isTTY;

    function setStdinTty(value: boolean): void {
      Object.defineProperty(process.stdin, 'isTTY', {
        value,
        configurable: true,
      });
    }

    afterEach(() => {
      setStdinTty(originalStdinIsTTY);
    });

    it.skipIf(isWindows)(
      'Should_ForwardInterrupt_When_StdinIsNotATerminal',
      async () => {
        // Arrange
        setStdinTty(false);
        const readyFile = join(workDir, 'ready');
        const script = `require('fs').writeFileSync(process.argv[1], 'ready'); setTimeout(() => process.exit(99), ${CHILD_SELF_EXIT_MS})`;
        const running = sut.run({
          command: process.execPath,
          args: ['-e', script, readyFile],
          env: parentEnvironment(),
        });
        await waitForFile(readyFile);

        // Act
        process.emit('SIGINT', 'SIGINT');
        const actual = await running;

        // Assert
        expect(actual).toEqual({ code: null, signal: 'SIGINT' });
      },
      15_000,
    );

    it.skipIf(isWindows)(
      'Should_NotDuplicateSigint_When_TerminalSendsInterrupt',
      async () => {
        // Arrange
        setStdinTty(true);
        const sigintListenersBefore = process.listenerCount('SIGINT');
        const readyFile = join(workDir, 'ready');
        const interruptedFile = join(workDir, 'interrupted');
        const script = [
          `const fs = require('fs');`,
          `process.on('SIGINT', () => { fs.writeFileSync(process.argv[2], 'interrupted'); process.exit(42); });`,
          `fs.writeFileSync(process.argv[1], 'ready');`,
          'setTimeout(() => process.exit(0), 1500);',
        ].join(' ');
        const running = sut.run({
          command: process.execPath,
          args: ['-e', script, readyFile, interruptedFile],
          env: parentEnvironment(),
        });
        await waitForFile(readyFile);
        const sigintListenersWhileRunning = process.listenerCount('SIGINT');

        // Act
        process.emit('SIGINT', 'SIGINT');
        const actual = await running;

        // Assert
        expect(actual).toEqual({ code: 0, signal: null });
        expect(existsSync(interruptedFile)).toBe(false);
        expect(sigintListenersWhileRunning).toBeGreaterThan(
          sigintListenersBefore,
        );
        expect(process.listenerCount('SIGINT')).toBe(sigintListenersBefore);
      },
      15_000,
    );
  });

  it('Should_RemoveSignalListeners_When_ChildExits', async () => {
    // Arrange
    const listenerCounts = () =>
      (['SIGTERM', 'SIGHUP', 'SIGINT'] as const).map((signal) =>
        process.listenerCount(signal),
      );
    const expected = listenerCounts();

    // Act
    const actual = await sut.run({
      command: process.execPath,
      args: ['-e', 'process.exit(5)'],
      env: parentEnvironment(),
    });

    // Assert
    expect(actual).toEqual({ code: 5, signal: null });
    expect(listenerCounts()).toEqual(expected);
  });
});
