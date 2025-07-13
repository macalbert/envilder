import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DispatchActionCommand } from '../../../../src/cli/application/dispatch/DispatchActionCommand';
import { DispatchActionCommandHandler } from '../../../../src/cli/application/dispatch/DispatchActionCommandHandler';
import type { Envilder } from '../../../../src/cli/application/EnvilderHandler';
import { OperationMode } from '../../../../src/cli/domain/OperationMode';

const mockEnvilder = {
  run: vi.fn(),
  importEnvFile: vi.fn(),
  pushSingleVariableToSSM: vi.fn(),
  keyVault: {},
  envFileManager: {},
  logger: {},
  envild: vi.fn(),
  processSecret: vi.fn(),
} as unknown as Envilder;

describe('DispatchActionCommandHandler', () => {
  const sut = new DispatchActionCommandHandler(mockEnvilder);

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
    expect(mockEnvilder.run).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
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
    expect(mockEnvilder.importEnvFile).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
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
    expect(mockEnvilder.pushSingleVariableToSSM).toHaveBeenCalledWith(
      'TEST_KEY',
      'test-value',
      '/test/path',
    );
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
