import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CommandNotExecutableError,
  CommandNotFoundError,
  EnvironmentTooLargeError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { CrossSpawnProcessRunner } from '../../../../../src/envilder/core/infrastructure/process/CrossSpawnProcessRunner';

const spawnState = vi.hoisted(() => ({
  errorCode: 'ENOENT',
  forceAsync: false,
}));

/**
 * Node emits only these spawn failures asynchronously on the child; every
 * other spawn failure (ETXTBSY, E2BIG, ELOOP, ...) is thrown synchronously.
 */
const ASYNCHRONOUS_SPAWN_ERRORS = new Set([
  'EACCES',
  'EAGAIN',
  'EMFILE',
  'ENFILE',
  'ENOENT',
]);

vi.mock('cross-spawn', () => {
  const spawn = vi.fn(() => {
    const error = Object.assign(
      new Error(`spawn failed: ${spawnState.errorCode}`),
      spawnState.errorCode === ''
        ? {}
        : { code: spawnState.errorCode, errno: -1, syscall: 'spawn' },
    );
    if (
      !spawnState.forceAsync &&
      !ASYNCHRONOUS_SPAWN_ERRORS.has(spawnState.errorCode)
    ) {
      throw error;
    }
    const child = Object.assign(new EventEmitter(), {
      kill: vi.fn(),
      pid: undefined,
    });
    setImmediate(() => {
      child.emit('error', error);
    });
    return child;
  });
  return { default: spawn };
});

describe('CrossSpawnProcessRunner spawn errors', () => {
  afterEach(() => {
    spawnState.errorCode = 'ENOENT';
    spawnState.forceAsync = false;
  });

  it('Should_ExitWith126_When_ExecutableIsBusy', async () => {
    // Arrange
    spawnState.errorCode = 'ETXTBSY';
    const sut = new CrossSpawnProcessRunner();

    // Act
    const actual = await sut
      .run({ command: './build/tool', args: [], env: {} })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(CommandNotExecutableError);
    expect((actual as Error).message).toContain('./build/tool');
    expect((actual as Error).message).toMatch(/ETXTBSY|text file busy/);
    expect((actual as Error).message).not.toContain('Permission denied');
  });

  it('Should_ReportEnvironmentTooLarge_When_SpawnThrowsE2big', async () => {
    // Arrange
    spawnState.errorCode = 'E2BIG';
    const sut = new CrossSpawnProcessRunner();

    // Act
    const actual = await sut
      .run({ command: 'node', args: ['app.js'], env: {} })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(EnvironmentTooLargeError);
    expect((actual as Error).message).toBe(
      'Environment too large to start the command (E2BIG).',
    );
  });

  it.each([
    ['SymlinkLoop', 'ELOOP'],
    ['ExecFormatError', 'ENOEXEC'],
    ['Directory', 'EISDIR'],
    ['PathComponentNotDirectory', 'ENOTDIR'],
  ])(
    'Should_RejectWithCommandNotExecutableError_When_SpawnThrows%s',
    async (_name, code) => {
      // Arrange
      spawnState.errorCode = code;
      const sut = new CrossSpawnProcessRunner();

      // Act
      const actual = await sut
        .run({ command: './bin/tool', args: [], env: {} })
        .catch((error: unknown) => error);

      // Assert
      expect(actual).toBeInstanceOf(CommandNotExecutableError);
      expect((actual as Error).message).toContain('./bin/tool');
      expect((actual as Error).message).toContain(code);
      expect((actual as Error).message).not.toContain('Permission denied');
    },
  );

  it('Should_RejectWithCommandNotExecutableError_When_ChildEmitsExecFormatError', async () => {
    // Arrange
    spawnState.errorCode = 'ENOEXEC';
    spawnState.forceAsync = true;
    const sut = new CrossSpawnProcessRunner();

    // Act
    const actual = await sut
      .run({ command: './bin/tool', args: [], env: {} })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(CommandNotExecutableError);
    expect((actual as Error).message).toContain('./bin/tool');
    expect((actual as Error).message).toContain('ENOEXEC');
  });

  it('Should_KeepPermissionDeniedMessage_When_SpawnFailsWithEacces', async () => {
    // Arrange
    spawnState.errorCode = 'EACCES';
    const sut = new CrossSpawnProcessRunner();

    // Act
    const actual = await sut
      .run({ command: './script.sh', args: [], env: {} })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(CommandNotExecutableError);
    expect((actual as Error).message).toBe('Permission denied: ./script.sh');
  });

  it('Should_ExitWith127_When_SpawnFailsWithEnoent', async () => {
    // Arrange
    const sut = new CrossSpawnProcessRunner();

    // Act
    const actual = await sut
      .run({ command: 'missing-tool', args: [], env: {} })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(CommandNotFoundError);
  });

  it.each([
    ['NameTooLong', 'ENAMETOOLONG'],
    ['UnknownCode', 'EWHATEVER'],
  ])(
    'Should_RejectWithCommandNotExecutableError_When_SpawnFailsWith%s',
    async (_name, code) => {
      // Arrange
      spawnState.errorCode = code;
      const sut = new CrossSpawnProcessRunner();

      // Act
      const actual = await sut
        .run({ command: './bin/tool', args: [], env: {} })
        .catch((error: unknown) => error);

      // Assert
      expect(actual).toBeInstanceOf(CommandNotExecutableError);
      expect((actual as Error).message).toContain('Cannot execute ./bin/tool');
      expect((actual as Error).message).toContain(`(${code})`);
    },
  );

  it.each([
    ['TryAgain', 'EAGAIN'],
    ['ProcessFileLimit', 'EMFILE'],
    ['SystemFileLimit', 'ENFILE'],
    ['OutOfMemory', 'ENOMEM'],
  ])(
    'Should_ReportEnvilderFailure_When_SpawnFailsBecauseOf%s',
    async (_name, code) => {
      // Arrange
      spawnState.errorCode = code;
      const sut = new CrossSpawnProcessRunner();

      // Act
      const actual = await sut
        .run({ command: './bin/tool', args: [], env: {} })
        .catch((error: unknown) => error);

      // Assert
      expect(actual).toBeInstanceOf(Error);
      expect(actual).not.toBeInstanceOf(CommandNotExecutableError);
      expect(actual).not.toBeInstanceOf(CommandNotFoundError);
      expect((actual as Error).message).toContain('./bin/tool');
      expect((actual as Error).message).toContain(code);
      expect((actual as Error).message).toContain('system resources');
    },
  );

  it('Should_ReportEnvilderFailureWithoutArguments_When_SpawnErrorHasNoCode', async () => {
    // Arrange
    spawnState.errorCode = '';
    const sut = new CrossSpawnProcessRunner();

    // Act
    const actual = await sut
      .run({
        command: 'curl',
        args: ['-H', 'Authorization: Bearer tok-SECRET-4Zt9'],
        env: {},
      })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(Error);
    expect(actual).not.toBeInstanceOf(CommandNotExecutableError);
    expect(actual).not.toBeInstanceOf(CommandNotFoundError);
    expect((actual as Error).message).not.toContain('tok-SECRET-4Zt9');
    expect((actual as Error).message).not.toContain('Authorization');
  });
});
