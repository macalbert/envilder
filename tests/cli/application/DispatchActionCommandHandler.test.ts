import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvilderBuilder } from '../../../src/cli/application/builders/EnvilderBuilder.js';
import {
  type CliOptions,
  DispatchActionCommandHandler,
  OperationMode,
} from '../../../src/cli/application/DispatchActionCommandHandler.js';

vi.mock('../../../src/cli/application/builders/EnvilderBuilder.js', () => {
  const mockEnvilder = {
    run: vi.fn(),
    importEnvFile: vi.fn(),
    pushSingleVariableToSSM: vi.fn(),
  };

  return {
    EnvilderBuilder: {
      build: vi.fn().mockReturnValue({
        withConsoleLogger: vi.fn().mockReturnThis(),
        withDefaultFileManager: vi.fn().mockReturnThis(),
        withAwsProvider: vi.fn().mockReturnThis(),
        create: vi.fn().mockReturnValue(mockEnvilder),
      }),
    },
  };
});

describe('DispatchActionCommandHandler', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should_CallExportSsmToEnv_When_ExportSsmToEnvModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler();
    const options: CliOptions = {
      map: 'path/to/map.json',
      envfile: 'path/to/.env',
    };
    const mockEnvilder = EnvilderBuilder.build().create();

    // Act
    await handler.handleCommand(options, OperationMode.EXPORT_SSM_TO_ENV);

    // Assert
    expect(EnvilderBuilder.build).toHaveBeenCalled();
    expect(mockEnvilder.run).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
  });

  it('Should_CallImportEnvToSsm_When_ImportEnvToSsmModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler();
    const options: CliOptions = {
      map: 'path/to/map.json',
      envfile: 'path/to/.env',
      import: true,
    };
    const mockEnvilder = EnvilderBuilder.build().create();

    // Act
    await handler.handleCommand(options, OperationMode.IMPORT_ENV_TO_SSM);

    // Assert
    expect(EnvilderBuilder.build).toHaveBeenCalled();
    expect(mockEnvilder.importEnvFile).toHaveBeenCalledWith(
      'path/to/map.json',
      'path/to/.env',
    );
  });

  it('Should_CallPushSingleVariableToSSM_When_PushSingleVariableModeIsProvided', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler();
    const options: CliOptions = {
      key: 'TEST_KEY',
      value: 'test-value',
      ssmPath: '/test/path',
    };
    const mockEnvilder = EnvilderBuilder.build().create();

    // Act
    await handler.handleCommand(options, OperationMode.PUSH_SINGLE_VARIABLE);

    // Assert
    expect(EnvilderBuilder.build).toHaveBeenCalled();
    expect(mockEnvilder.pushSingleVariableToSSM).toHaveBeenCalledWith(
      'TEST_KEY',
      'test-value',
      '/test/path',
    );
  });

  it('Should_ThrowError_When_MapAndEnvfileAreMissingForExportMode', async () => {
    // Arrange
    const handler = new DispatchActionCommandHandler();
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
    const handler = new DispatchActionCommandHandler();
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
