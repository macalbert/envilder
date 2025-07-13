import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DispatchActionCommand } from '../../../../src/envilder/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../src/envilder/application/dispatch/DispatchActionCommandHandler';
import type { PullSsmToEnvCommandHandler } from '../../../../src/envilder/application/pullSsmToEnv/PullSsmToEnvCommandHandler';
import type { PushEnvToSsmCommandHandler } from '../../../../src/envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler';
import type { PushSingleCommandHandler } from '../../../../src/envilder/application/pushSingle/PushSingleCommandHandler';
import { OperationMode } from '../../../../src/envilder/domain/OperationMode';

const mockPullHandler = {
  handle: vi.fn(),
} as unknown as PullSsmToEnvCommandHandler;

const mockPushHandler = {
  handle: vi.fn(),
} as unknown as PushEnvToSsmCommandHandler;

const mockPushSingleHandler = {
  handle: vi.fn(),
} as unknown as PushSingleCommandHandler;

describe('DispatchActionCommandHandler', () => {
  const sut = new DispatchActionCommandHandler(
    mockPullHandler,
    mockPushHandler,
    mockPushSingleHandler,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should_CallPullSsmToEnv_When_PullSsmToEnvModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PULL_SSM_TO_ENV,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPullHandler.handle).toHaveBeenCalled();
  });

  it('Should_CallPushEnvToSsm_When_PushEnvToSsmModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PUSH_ENV_TO_SSM,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPushHandler.handle).toHaveBeenCalled();
  });

  it('Should_CallPushSingleToSSM_When_PushSingleModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
      undefined,
      'TEST_KEY',
      'test-value',
      '/test/path',
      undefined,
      OperationMode.PUSH_SINGLE,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPushSingleHandler.handle).toHaveBeenCalled();
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForExportMode', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PUSH_ENV_TO_SSM,
    );

    // Act
    const action = () => sut.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForImportMode', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PULL_SSM_TO_ENV,
    );

    // Act
    const action = () => sut.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });

  it('Should_CallPushEnvToSsm_When_PushFlagIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.PUSH_ENV_TO_SSM,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPushHandler.handle).toHaveBeenCalled();
  });
});
