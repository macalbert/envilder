import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { PushEnvToSsmCommand } from '../../../../src/envilder/application/pushEnvToSsm/PushEnvToSsmCommand';
import { PushEnvToSsmCommandHandler } from '../../../../src/envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler';
import type { ILogger } from '../../../../src/envilder/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/envilder/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../src/envilder/domain/ports/IVariableStore';

describe('PushEnvToSsmCommandHandler', () => {
  let mockSecretProvider: ISecretProvider;
  let mockVariableStore: IVariableStore & {
    getMapping: Mock;
    getEnvironment: Mock;
    saveEnvironment: Mock;
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

    mockVariableStore = {
      getMapping: vi.fn().mockResolvedValue({} as Record<string, string>),
      getEnvironment: vi.fn().mockResolvedValue({} as Record<string, string>),
      saveEnvironment: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    sut = new PushEnvToSsmCommandHandler(
      mockSecretProvider,
      mockVariableStore,
      mockLogger,
    );
  });

  it('Should_PushEnvFileToSSM_When_ValidEnvironmentVariablesAreProvided', async () => {
    // Arrange
    mockVariableStore.getMapping.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
      ANOTHER_VAR: '/path/to/ssm/another',
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
      TEST_ENV_VAR: 'test-value',
      ANOTHER_VAR: 'another-value',
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockVariableStore.getMapping).toHaveBeenCalledWith(mockMapPath);
    expect(mockVariableStore.getEnvironment).toHaveBeenCalledWith(
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
    mockVariableStore.getMapping.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
      MISSING_VAR: '/path/to/ssm/missing',
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
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

    mockVariableStore.getMapping.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
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
