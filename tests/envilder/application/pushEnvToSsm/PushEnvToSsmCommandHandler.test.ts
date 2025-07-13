import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { PushEnvToSsmCommand } from '../../../../src/envilder/application/pushEnvToSsm/PushEnvToSsmCommand';
import { PushEnvToSsmCommandHandler } from '../../../../src/envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler';
import type { IEnvFileManager } from '../../../../src/envilder/domain/ports/IEnvFileManager';
import type { ILogger } from '../../../../src/envilder/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/envilder/domain/ports/ISecretProvider';

describe('PushEnvToSsmCommandHandler', () => {
  let mockSecretProvider: ISecretProvider;
  let mockEnvFileManager: IEnvFileManager & {
    loadMapFile: Mock;
    loadEnvFile: Mock;
    saveEnvFile: Mock;
  };
  let mockLogger: ILogger;
  let sut: PushEnvToSsmCommandHandler;

  const mockMapPath = 'map-path.json';
  const mockEnvFilePath = 'env-file.env';

  beforeEach(() => {
    mockSecretProvider = {
      getSecret: vi.fn(),
      setSecret: vi.fn(async (): Promise<void> => {}),
    };

    mockEnvFileManager = {
      loadMapFile: vi.fn().mockResolvedValue({} as Record<string, string>),
      loadEnvFile: vi.fn().mockResolvedValue({} as Record<string, string>),
      saveEnvFile: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    sut = new PushEnvToSsmCommandHandler(
      mockSecretProvider,
      mockEnvFileManager,
      mockLogger,
    );
  });

  it('Should_PushEnvFileToSSM_When_ValidEnvironmentVariablesAreProvided', async () => {
    // Arrange
    mockEnvFileManager.loadMapFile.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
      ANOTHER_VAR: '/path/to/ssm/another',
    });

    mockEnvFileManager.loadEnvFile.mockResolvedValue({
      TEST_ENV_VAR: 'test-value',
      ANOTHER_VAR: 'another-value',
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockEnvFileManager.loadMapFile).toHaveBeenCalledWith(mockMapPath);
    expect(mockEnvFileManager.loadEnvFile).toHaveBeenCalledWith(
      mockEnvFilePath,
    );
    expect(mockSecretProvider.setSecret).toHaveBeenCalledTimes(2);
    expect(mockSecretProvider.setSecret).toHaveBeenCalledWith(
      '/path/to/ssm/test',
      'test-value',
    );
    expect(mockSecretProvider.setSecret).toHaveBeenCalledWith(
      '/path/to/ssm/another',
      'another-value',
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Successfully pushed environment variables from 'env-file.env' to AWS SSM.`,
    );
  });

  it('Should_Warning_When_ImportsNotMatchesKey', async () => {
    // Arrange
    mockEnvFileManager.loadMapFile.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
      MISSING_VAR: '/path/to/ssm/missing',
    });

    mockEnvFileManager.loadEnvFile.mockResolvedValue({
      TEST_ENV_VAR: 'test-value',
      // MISSING_VAR is not present
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockSecretProvider.setSecret).toHaveBeenCalledTimes(1);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      `Warning: Environment variable MISSING_VAR not found in env-file.env`,
    );
  });

  it('Should_ThrowError_When_ImportFails', async () => {
    // Arrange
    const mockError = new Error('Failed to import');

    mockSecretProvider.setSecret = vi.fn(async (): Promise<void> => {
      throw mockError;
    });

    mockEnvFileManager.loadMapFile.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
    });

    mockEnvFileManager.loadEnvFile.mockResolvedValue({
      TEST_ENV_VAR: 'test-value',
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push environment file: Failed to import',
    );
  });
});
