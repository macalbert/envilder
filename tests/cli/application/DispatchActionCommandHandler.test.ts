import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DispatchActionCommandHandler } from '../../../src/cli/application/DispatchActionCommandHandler.js';
import type { Envilder } from '../../../src/cli/application/EnvilderHandler.js';
import { DispatchActionCommand } from '../../../src/cli/domain/commands/DispatchActionCommand.js';
import { OperationMode } from '../../../src/cli/domain/OperationMode.js';

// Create mock Envilder object as a partial implementation
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
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should_CallExportSsmToEnv_When_ExportSsmToEnvModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
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
    await handler.handleCommand(command);

    // Assert
    expect(mockEnvilder.run).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
  });

  it('Should_CallImportEnvToSsm_When_ImportEnvToSsmModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
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
    await handler.handleCommand(command);

    // Assert
    expect(mockEnvilder.importEnvFile).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
  });

  it('Should_CallPushSingleVariableToSSM_When_PushSingleVariableModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
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
    await handler.handleCommand(command);

    // Assert
    expect(mockEnvilder.pushSingleVariableToSSM).toHaveBeenCalledWith(
      'TEST_KEY',
      'test-value',
      '/test/path',
    );
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForExportMode', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
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
    const action = () => handler.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForImportMode', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
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
    const action = () => handler.handleCommand(command);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });
});
