import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CommandNotExecutableError,
  CommandNotFoundError,
  EnvironmentTooLargeError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { CrossSpawnProcessRunner } from '../../../../../src/envilder/core/infrastructure/process/CrossSpawnProcessRunner';

const spawnState = vi.hoisted(() => ({ errorCode: 'ENOENT' }));

/**
 * Node throws some spawn failures synchronously (for example ETXTBSY and
 * E2BIG) and emits others asynchronously on the child (EACCES, ENOENT, ...).
 */
const SYNCHRONOUS_SPAWN_ERRORS = new Set(['ETXTBSY', 'E2BIG']);

vi.mock('cross-spawn', () => {
  const spawn = vi.fn(() => {
    const error = Object.assign(
      new Error(`spawn failed: ${spawnState.errorCode}`),
      { code: spawnState.errorCode, errno: -1, syscall: 'spawn' },
    );
    if (SYNCHRONOUS_SPAWN_ERRORS.has(spawnState.errorCode)) {
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
});
