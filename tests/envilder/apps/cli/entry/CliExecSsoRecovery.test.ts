import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import { main } from '../../../../../src/envilder/apps/cli/entry/Cli';
import { SilentExitError } from '../../../../../src/envilder/apps/cli/errors/SilentExitError';
import { DispatchActionCommandHandler } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import { SsoSessionExpiredError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { AwsSsmSecretProvider } from '../../../../../src/envilder/core/infrastructure/aws/AwsSsmSecretProvider';
import { CrossSpawnProcessRunner } from '../../../../../src/envilder/core/infrastructure/process/CrossSpawnProcessRunner';
import { FileVariableStore } from '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore';

vi.mock(
  '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
  async () => {
    const actual = await vi.importActual(
      '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
    );
    return {
      ...(actual as object),
      readMapFileConfig: vi.fn().mockResolvedValue({}),
    };
  },
);

vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...(actual as object),
    existsSync: vi.fn().mockReturnValue(true),
  };
});

const prompt = vi.hoisted(() => ({ answer: 'n' }));

vi.mock('node:child_process', async () => {
  const actual =
    await vi.importActual<typeof import('node:child_process')>(
      'node:child_process',
    );
  const { EventEmitter } =
    await vi.importActual<typeof import('node:events')>('node:events');
  return {
    ...actual,
    spawn: vi.fn(() => {
      const child = new EventEmitter();
      setImmediate(() => child.emit('close', 0));
      return child;
    }),
  };
});

vi.mock('node:readline', async () => {
  const actual = await vi.importActual('node:readline');
  return {
    ...(actual as object),
    createInterface: vi.fn(({ output }: { output: NodeJS.WritableStream }) => ({
      question: (query: string, answer: (reply: string) => void) => {
        output.write(query);
        answer(prompt.answer);
      },
      close: () => undefined,
    })),
  };
});

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

class ProcessExitCalled extends Error {
  constructor(readonly code: number) {
    super(`process.exit(${code})`);
  }
}

async function runCli(args: string[]): Promise<number> {
  process.argv = ['node', 'envilder', ...args];
  return main().then(
    () => Number(process.exitCode ?? 0),
    (error: unknown) => {
      if (error instanceof ProcessExitCalled) {
        return error.code;
      }
      if (error instanceof SilentExitError) {
        return error.code;
      }
      return 1;
    },
  );
}

/** Completes a mocked stream write the way Node does: callback on next tick. */
function completeWrite(rest: unknown[], error?: Error): void {
  const callback = rest.find(
    (arg): arg is (error?: Error | null) => void => typeof arg === 'function',
  );
  process.nextTick(() => callback?.(error ?? null));
}

function strip(value: unknown): string {
  return String(value).replace(ANSI_PATTERN, '');
}

describe('Cli exec SSO recovery prompt', () => {
  const originalStdoutIsTTY = process.stdout.isTTY;
  const originalStdinIsTTY = process.stdin.isTTY;
  const originalStderrIsTTY = process.stderr.isTTY;
  let runSpy: MockInstance;
  let stdoutChunks: string[];
  let stderrChunks: string[];

  beforeEach(() => {
    process.exitCode = undefined;
    prompt.answer = 'n';
    vi.stubEnv('GITHUB_ACTIONS', undefined);
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
      value: true,
      configurable: true,
    });
    Object.defineProperty(process.stderr, 'isTTY', {
      value: true,
      configurable: true,
    });
    vi.spyOn(FileVariableStore.prototype, 'getMapping').mockResolvedValue({
      DB_URL: '/app/dev/db-url',
    });
    vi.spyOn(AwsSsmSecretProvider.prototype, 'getSecret').mockRejectedValue(
      new SsoSessionExpiredError('dev'),
    );
    vi.spyOn(AwsSsmSecretProvider.prototype, 'logIdentity').mockResolvedValue(
      undefined,
    );
    runSpy = vi
      .spyOn(CrossSpawnProcessRunner.prototype, 'run')
      .mockResolvedValue({ code: 0, signal: null });

    stdoutChunks = [];
    stderrChunks = [];
    const toStdout = (...args: unknown[]) => {
      stdoutChunks.push(`${args.map(String).join(' ')}\n`);
    };
    const toStderr = (...args: unknown[]) => {
      stderrChunks.push(`${args.map(String).join(' ')}\n`);
    };
    vi.spyOn(console, 'log').mockImplementation(toStdout);
    vi.spyOn(console, 'info').mockImplementation(toStdout);
    vi.spyOn(console, 'warn').mockImplementation(toStderr);
    vi.spyOn(console, 'error').mockImplementation(toStderr);
    vi.spyOn(process.stdout, 'write').mockImplementation(((
      chunk: unknown,
      ...rest: unknown[]
    ) => {
      stdoutChunks.push(String(chunk));
      completeWrite(rest);
      return true;
    }) as typeof process.stdout.write);
    vi.spyOn(process.stderr, 'write').mockImplementation(((
      chunk: unknown,
      ...rest: unknown[]
    ) => {
      stderrChunks.push(String(chunk));
      completeWrite(rest);
      return true;
    }) as typeof process.stderr.write);
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new ProcessExitCalled(code ?? 0);
    }) as typeof process.exit);
  });

  afterEach(() => {
    process.exitCode = undefined;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalStdoutIsTTY,
      configurable: true,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
      value: originalStdinIsTTY,
      configurable: true,
    });
    Object.defineProperty(process.stderr, 'isTTY', {
      value: originalStderrIsTTY,
      configurable: true,
    });
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('Should_PromptOnStderr_When_SsoSessionExpiresInExecMode', async () => {
    // Act
    const actual = await runCli(['exec', '--', 'node', 'app.js']);

    // Assert
    expect(actual).toBe(125);
    expect(strip(stderrChunks.join(''))).toContain(
      "Run 'aws sso login --profile dev' now? [y/N]",
    );
    expect(strip(stdoutChunks.join(''))).toBe('');
    expect(runSpy).not.toHaveBeenCalled();
  });

  describe('accepted login', () => {
    beforeEach(async () => {
      prompt.answer = 'y';
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockClear();
    });

    it('Should_RouteLoginOutputToStderr_When_SsoRecoveryIsAcceptedInExecMode', async () => {
      // Arrange
      vi.mocked(AwsSsmSecretProvider.prototype.getSecret)
        .mockReset()
        .mockRejectedValueOnce(new SsoSessionExpiredError('dev'))
        .mockResolvedValue('resolved-after-login');
      runSpy.mockResolvedValue({ code: 4, signal: null });
      const { spawn } = await import('node:child_process');

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      const awsCalls = vi
        .mocked(spawn)
        .mock.calls.filter(([command]) => command === 'aws');
      expect(awsCalls).toHaveLength(1);
      const stdio = (awsCalls[0][2] as { stdio?: unknown }).stdio as unknown[];
      expect(Array.isArray(stdio)).toBe(true);
      expect([2, process.stderr]).toContain(stdio[1]);
      expect(actual).toBe(4);
      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(strip(stdoutChunks.join(''))).toBe('');
    });

    it('Should_KeepInheritedLoginOutput_When_SsoRecoveryIsAcceptedInPullMode', async () => {
      // Arrange
      vi.spyOn(DispatchActionCommandHandler.prototype, 'handleCommand')
        .mockRejectedValueOnce(new SsoSessionExpiredError('dev'))
        .mockResolvedValue(undefined);
      const { spawn } = await import('node:child_process');

      // Act
      const actual = await runCli(['--map', 'map.json', '--envfile', '.env']);

      // Assert
      const awsCalls = vi
        .mocked(spawn)
        .mock.calls.filter(([command]) => command === 'aws');
      expect(actual).toBe(0);
      expect(awsCalls).toHaveLength(1);
      expect(awsCalls[0][2]).toMatchObject({ stdio: 'inherit' });
    });
  });

  describe('interactivity', () => {
    const SSO_PROMPT = "Run 'aws sso login --profile dev' now? [y/N]";

    function setTty(
      stream: NodeJS.ReadStream | NodeJS.WriteStream,
      value: boolean,
    ): void {
      Object.defineProperty(stream, 'isTTY', { value, configurable: true });
    }

    it('Should_PromptForSsoLogin_When_StdoutIsRedirectedInExecMode', async () => {
      // Arrange
      setTty(process.stdout, false);
      prompt.answer = 'y';
      vi.mocked(AwsSsmSecretProvider.prototype.getSecret)
        .mockReset()
        .mockRejectedValueOnce(new SsoSessionExpiredError('dev'))
        .mockResolvedValue('resolved-after-login');

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(0);
      expect(strip(stderrChunks.join(''))).toContain(SSO_PROMPT);
      expect(strip(stdoutChunks.join(''))).toBe('');
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it('Should_NotPrompt_When_StderrIsNotInteractiveInExecMode', async () => {
      // Arrange
      setTty(process.stderr, false);
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockClear();

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(
        strip(`${stdoutChunks.join('')}${stderrChunks.join('')}`),
      ).not.toContain(SSO_PROMPT);
      expect(
        vi.mocked(spawn).mock.calls.filter(([command]) => command === 'aws'),
      ).toEqual([]);
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_NotPromptInPullMode_When_StdoutIsNotInteractive', async () => {
      // Arrange
      setTty(process.stdout, false);
      vi.spyOn(
        DispatchActionCommandHandler.prototype,
        'handleCommand',
      ).mockRejectedValue(new SsoSessionExpiredError('dev'));
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockClear();

      // Act
      const actual = await runCli(['--map', 'map.json', '--envfile', '.env']);

      // Assert
      expect(actual).toBe(1);
      expect(
        strip(`${stdoutChunks.join('')}${stderrChunks.join('')}`),
      ).not.toContain(SSO_PROMPT);
      expect(
        vi.mocked(spawn).mock.calls.filter(([command]) => command === 'aws'),
      ).toEqual([]);
    });
  });

  it('Should_NotPromptOrRestartChild_When_SsoErrorIsRaisedAfterSpawn', async () => {
    // Arrange
    vi.mocked(AwsSsmSecretProvider.prototype.getSecret)
      .mockReset()
      .mockResolvedValue('resolved-value');
    runSpy.mockRejectedValue(new SsoSessionExpiredError('dev'));

    // Act
    const actual = await runCli(['exec', '--', 'node', 'app.js']);

    // Assert
    expect(actual).toBe(125);
    expect(
      strip(`${stdoutChunks.join('')}${stderrChunks.join('')}`),
    ).not.toContain('now? [y/N]');
    expect(runSpy).toHaveBeenCalledTimes(1);
  });
});
