import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type CliOptions,
  DispatchActionCommandHandler,
  OperationMode,
} from '../../../src/cli/application/DispatchActionCommandHandler.js';
import type { Envilder } from '../../../src/cli/application/EnvilderHandler.js';

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
    const options: CliOptions = {
      map: 'path/to/map.json',
      envfile: 'path/to/.env',
    };

    // Act
    await handler.handleCommand(options, OperationMode.EXPORT_SSM_TO_ENV);

    // Assert
    expect(mockEnvilder.run).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
  });

  it('Should_CallImportEnvToSsm_When_ImportEnvToSsmModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
    const options: CliOptions = {
      map: 'path/to/map.json',
      envfile: 'path/to/.env',
      import: true,
    };

    // Act
    await handler.handleCommand(options, OperationMode.IMPORT_ENV_TO_SSM);

    // Assert
    expect(mockEnvilder.importEnvFile).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
  });

  it('Should_CallPushSingleVariableToSSM_When_PushSingleVariableModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
    const options: CliOptions = {
      key: 'TEST_KEY',
      value: 'test-value',
      ssmPath: '/test/path',
    };

    // Act
    await handler.handleCommand(options, OperationMode.PUSH_SINGLE_VARIABLE);

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
    const options: CliOptions = {};

    // Act
    const action = () =>
      handler.handleCommand(options, OperationMode.IMPORT_ENV_TO_SSM);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForImportMode', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler(mockEnvilder);
    const options: CliOptions = { import: true };

    // Act
    const action = () =>
      handler.handleCommand(options, OperationMode.IMPORT_ENV_TO_SSM);

    // Assert
    await expect(action).rejects.toThrow(
      'Missing required arguments: --map and --envfile',
    );
  });
});
