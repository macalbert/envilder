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

vi.mock('node:readline', async () => {
  const actual = await vi.importActual('node:readline');
  return {
    ...(actual as object),
    createInterface: vi.fn(({ output }: { output: NodeJS.WritableStream }) => ({
      question: (query: string, answer: (reply: string) => void) => {
        output.write(query);
        answer('n');
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

function strip(value: unknown): string {
  return String(value).replace(ANSI_PATTERN, '');
}

describe('Cli exec SSO recovery prompt', () => {
  const originalStdoutIsTTY = process.stdout.isTTY;
  const originalStdinIsTTY = process.stdin.isTTY;
  let runSpy: MockInstance;
  let stdoutChunks: string[];
  let stderrChunks: string[];

  beforeEach(() => {
    process.exitCode = undefined;
    vi.stubEnv('GITHUB_ACTIONS', undefined);
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
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
    vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: unknown) => {
      stdoutChunks.push(String(chunk));
      return true;
    }) as typeof process.stdout.write);
    vi.spyOn(process.stderr, 'write').mockImplementation(((chunk: unknown) => {
      stderrChunks.push(String(chunk));
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
});
