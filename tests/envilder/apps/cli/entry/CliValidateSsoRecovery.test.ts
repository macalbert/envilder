import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from '../../../../../src/envilder/apps/cli/entry/Cli';
import { SilentExitError } from '../../../../../src/envilder/apps/cli/errors/SilentExitError';
import { SsoSessionExpiredError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { AwsSsmSecretProvider } from '../../../../../src/envilder/core/infrastructure/aws/AwsSsmSecretProvider';

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

function strip(value: string): string {
  return value.replace(ANSI_PATTERN, '');
}

async function runCli(args: string[]): Promise<number> {
  process.argv = ['node', 'envilder', ...args];
  return main().then(
    () => 0,
    (error: unknown) => (error instanceof SilentExitError ? error.code : 1),
  );
}

describe('Cli validate SSO recovery prompt with --format json', () => {
  const originalStdoutIsTTY = process.stdout.isTTY;
  const originalStdinIsTTY = process.stdin.isTTY;
  const originalStderrIsTTY = process.stderr.isTTY;
  let workDir: string;
  let mapPath: string;
  let stdoutChunks: string[];
  let stderrChunks: string[];

  beforeEach(async () => {
    prompt.answer = 'y';
    workDir = await mkdtemp(join(tmpdir(), 'envilder-validate-sso-'));
    mapPath = join(workDir, 'map.json');
    await writeFile(
      mapPath,
      JSON.stringify({ $config: { profile: 'dev' }, DB_URL: '/app/db-url' }),
    );
    for (const stream of [process.stdout, process.stdin, process.stderr]) {
      Object.defineProperty(stream, 'isTTY', {
        value: true,
        configurable: true,
      });
    }
    vi.spyOn(AwsSsmSecretProvider.prototype, 'checkSecretsExist')
      .mockRejectedValueOnce(new SsoSessionExpiredError('dev'))
      .mockResolvedValue(new Map([['/app/db-url', { status: 'exists' }]]));

    stdoutChunks = [];
    stderrChunks = [];
    const collect =
      (chunks: string[]) =>
      (...args: unknown[]) => {
        chunks.push(`${args.map(String).join(' ')}\n`);
      };
    vi.spyOn(console, 'log').mockImplementation(collect(stdoutChunks));
    vi.spyOn(console, 'info').mockImplementation(collect(stdoutChunks));
    vi.spyOn(console, 'warn').mockImplementation(collect(stderrChunks));
    vi.spyOn(console, 'error').mockImplementation(collect(stderrChunks));
    vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: unknown) => {
      stdoutChunks.push(String(chunk));
      return true;
    }) as typeof process.stdout.write);
    vi.spyOn(process.stderr, 'write').mockImplementation(((chunk: unknown) => {
      stderrChunks.push(String(chunk));
      return true;
    }) as typeof process.stderr.write);
  });

  afterEach(async () => {
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
    vi.restoreAllMocks();
    await rm(workDir, { recursive: true, force: true });
  });

  it('Should_PromptOnStderrAndKeepStdoutJson_When_SsoSessionExpires', async () => {
    // Arrange
    const { spawn } = await import('node:child_process');
    vi.mocked(spawn).mockClear();

    // Act
    const actual = await runCli([
      'validate',
      '--map',
      mapPath,
      '--format',
      'json',
    ]);

    // Assert
    expect(actual).toBe(0);
    expect(strip(stderrChunks.join(''))).toContain(
      "Run 'aws sso login --profile dev' now? [y/N]",
    );
    const awsCalls = vi
      .mocked(spawn)
      .mock.calls.filter(([command]) => command === 'aws');
    const stdio = (awsCalls[0][2] as { stdio?: unknown }).stdio as unknown[];
    expect(stdio[1]).toBe(2);
    expect(JSON.parse(stdoutChunks.join(''))).toMatchObject({
      valid: true,
      keys: [{ name: 'DB_URL', status: 'exists' }],
    });
  });

  it('Should_PromptOnStderr_When_JsonStdoutIsRedirected', async () => {
    // Arrange
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      configurable: true,
    });

    // Act
    const actual = await runCli([
      'validate',
      '--map',
      mapPath,
      '--format',
      'json',
    ]);

    // Assert
    expect(actual).toBe(0);
    expect(strip(stderrChunks.join(''))).toContain(
      "Run 'aws sso login --profile dev' now? [y/N]",
    );
    expect(JSON.parse(stdoutChunks.join(''))).toMatchObject({ valid: true });
  });

  it('Should_PrintErrorAsJson_When_SsoLoginIsDeclined', async () => {
    // Arrange
    prompt.answer = 'n';

    // Act
    const actual = await runCli([
      'validate',
      '--map',
      mapPath,
      '--format',
      'json',
    ]);

    // Assert
    expect(actual).toBe(1);
    const json = JSON.parse(stdoutChunks.join(''));
    expect(json).not.toHaveProperty('keys');
    expect(json).toMatchObject({
      valid: false,
      error: { message: 'Validation stopped before every check finished.' },
    });
  });
});
