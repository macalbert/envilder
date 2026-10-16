import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandNotExecutableError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { CrossSpawnProcessRunner } from '../../../../../src/envilder/core/infrastructure/process/CrossSpawnProcessRunner';

type FakeChild = EventEmitter & {
  kill: ReturnType<typeof vi.fn>;
  exitCode: number | null;
  signalCode: NodeJS.Signals | null;
  pid: number | undefined;
};

const childState = vi.hoisted(() => ({
  current: undefined as unknown,
}));

vi.mock('cross-spawn', () => {
  const spawn = vi.fn(() => childState.current);
  return { default: spawn };
});

function createFakeChild(): FakeChild {
  return Object.assign(new EventEmitter(), {
    kill: vi.fn(() => true),
    exitCode: null,
    signalCode: null,
    pid: 4242,
  });
}

function killError(): NodeJS.ErrnoException {
  return Object.assign(new Error('kill EPERM'), {
    code: 'EPERM',
    errno: -1,
    syscall: 'kill',
  });
}

describe('CrossSpawnProcessRunner child errors after spawn', () => {
  let child: FakeChild;
  let sut: CrossSpawnProcessRunner;

  beforeEach(() => {
    child = createFakeChild();
    childState.current = child;
    sut = new CrossSpawnProcessRunner();
  });

  it('Should_KeepWaitingForExit_When_SignalDeliveryFailsAfterSpawn', async () => {
    // Arrange
    const running = sut.run({ command: 'node', args: ['app.js'], env: {} });
    child.emit('spawn');

    // Act
    child.emit('error', killError());
    child.emit('error', killError());
    child.emit('exit', 0, null);
    const actual = await running;

    // Assert
    expect(actual).toEqual({ code: 0, signal: null });
  });

  it('Should_KeepForwardingSignals_When_SignalDeliveryFailsAfterSpawn', async () => {
    // Arrange
    const running = sut.run({ command: 'node', args: ['app.js'], env: {} });
    child.emit('spawn');
    child.emit('error', killError());

    // Act
    process.emit('SIGTERM', 'SIGTERM');
    child.emit('exit', null, 'SIGTERM');
    const actual = await running;

    // Assert
    expect(child.kill).toHaveBeenCalledWith('SIGTERM');
    expect(actual).toEqual({ code: null, signal: 'SIGTERM' });
  });

  it('Should_RejectWithSpawnError_When_ErrorIsEmittedBeforeSpawn', async () => {
    // Arrange
    const running = sut.run({ command: './script.sh', args: [], env: {} });

    // Act
    child.emit(
      'error',
      Object.assign(new Error('spawn EACCES'), {
        code: 'EACCES',
        syscall: 'spawn ./script.sh',
      }),
    );
    const actual = await running.catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(CommandNotExecutableError);
    expect((actual as Error).message).toBe('Permission denied: ./script.sh');
  });
});
