import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DispatchActionCommand } from '../../../../src/envilder/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../src/envilder/application/dispatch/DispatchActionCommandHandler';
import type { ExportSsmToEnvCommandHandler } from '../../../../src/envilder/application/exportSsmToEnv/ExportSsmToEnvCommandHandler';
import type { PushEnvToSsmCommandHandler } from '../../../../src/envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler';
import type { PushSingleVariableCommandHandler } from '../../../../src/envilder/application/pushSingleVariable/PushSingleVariableCommandHandler';
import { OperationMode } from '../../../../src/envilder/domain/OperationMode';

const mockExportSsmToEnvCommandHandler = {
  handle: vi.fn(),
} as unknown as ExportSsmToEnvCommandHandler;

const mockPushEnvToSsmCommandHandler = {
  handle: vi.fn(),
} as unknown as PushEnvToSsmCommandHandler;

const mockPushSingleVariableCommandHandler = {
  handle: vi.fn(),
} as unknown as PushSingleVariableCommandHandler;

describe('DispatchActionCommandHandler', () => {
  const sut = new DispatchActionCommandHandler(
    mockExportSsmToEnvCommandHandler,
    mockPushEnvToSsmCommandHandler,
    mockPushSingleVariableCommandHandler,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should_CallExportSsmToEnv_When_ExportSsmToEnvModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      OperationMode.EXPORT_SSM_TO_ENV,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockExportSsmToEnvCommandHandler.handle).toHaveBeenCalled();
  });

  it('Should_CallImportEnvToSsm_When_ImportEnvToSsmModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      'path/to/map.json',
      'path/to/.env',
      undefined,
      undefined,
      undefined,
      undefined,
      true,
      OperationMode.IMPORT_ENV_TO_SSM,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPushEnvToSsmCommandHandler.handle).toHaveBeenCalled();
  });

  it('Should_CallPushSingleVariableToSSM_When_PushSingleVariableModeIsProvided', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
      undefined,
      'TEST_KEY',
      'test-value',
      '/test/path',
      undefined,
      undefined,
      OperationMode.PUSH_SINGLE_VARIABLE,
    );

    // Act
    await sut.handleCommand(command);

    // Assert
    expect(mockPushSingleVariableCommandHandler.handle).toHaveBeenCalled();
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForExportMode', async () => {
    // Arrange
    const command = new DispatchActionCommand(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      OperationMode.IMPORT_ENV_TO_SSM,
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
      true,
      OperationMode.IMPORT_ENV_TO_SSM,
    );

    // Act
    const action = () => sut.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });
});
