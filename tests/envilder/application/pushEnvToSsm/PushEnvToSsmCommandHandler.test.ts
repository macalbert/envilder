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
    // Only TEST_ENV_VAR should be pushed (MISSING_VAR is skipped)
    expect(mockSecretProvider.setSecret).toHaveBeenCalledTimes(1);
    expect(mockSecretProvider.setSecret).toHaveBeenCalledWith(
      '/path/to/ssm/test',
      'test-value',
    );
  });

  it('Should_ThrowError_When_MultipleVariablesPointToSamePathWithDifferentValues', async () => {
    // Arrange
    mockVariableStore.getMapping.mockResolvedValue({
      API_KEY: '/path/to/api-key',
      NEXT_PUBLIC_API_KEY: '/path/to/api-key', // Same path
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
      API_KEY: 'secret123',
      NEXT_PUBLIC_API_KEY: 'secret456', // Different value!
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow(
      "Conflicting values for SSM path '/path/to/api-key': 'API_KEY' has value '*********' but 'NEXT_PUBLIC_API_KEY' has value '*********'",
    );
    expect(mockSecretProvider.setSecret).not.toHaveBeenCalled();
  });

  it('Should_PushOnlyOnce_When_MultipleVariablesPointToSamePathWithSameValue', async () => {
    // Arrange
    mockVariableStore.getMapping.mockResolvedValue({
      API_KEY: '/path/to/api-key',
      NEXT_PUBLIC_API_KEY: '/path/to/api-key', // Same path
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
      API_KEY: 'secret123',
      NEXT_PUBLIC_API_KEY: 'secret123', // Same value
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    // Should only push once to the SSM path
    expect(mockSecretProvider.setSecret).toHaveBeenCalledTimes(1);
    expect(mockSecretProvider.setSecret).toHaveBeenCalledWith(
      '/path/to/api-key',
      'secret123',
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('API_KEY, NEXT_PUBLIC_API_KEY'),
    );
  });

  it('Should_NotShowAnyLogDescriptiveError_When_NoErrorsThrown', async () => {
    // Arrange
    mockVariableStore.getMapping.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
      TEST_ENV_VAR: 'test-value',
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    // Should NOT show any "Failed..." error message
    expect(mockLogger.error).not.toHaveBeenCalled();
    expect(mockLogger.error).not.toHaveBeenCalledWith(
      expect.stringContaining('Failed to push environment file'),
    );
    // Should show success message
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Successfully pushed environment variables from 'env-file.env' to AWS SSM.`,
    );
  });

  it('Should_LogDescriptiveError_When_NonErrorObjectIsThrown', async () => {
    // Arrange
    mockSecretProvider.setSecret = vi.fn(async (): Promise<void> => {
      throw { code: 'AWS_ERROR', message: 'Access denied' };
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
    await expect(action).rejects.toBeDefined();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push environment file: Object error (code: AWS_ERROR, message: Access denied)',
    );
  });

  it('Should_LogStringError_When_StringIsThrown', async () => {
    // Arrange
    mockSecretProvider.setSecret = vi.fn(async (): Promise<void> => {
      throw 'Connection timeout';
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
    await expect(action).rejects.toBe('Connection timeout');
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push environment file: Connection timeout',
    );
  });

  it('Should_LogUndefinedError_When_UndefinedIsThrown', async () => {
    // Arrange
    mockSecretProvider.setSecret = vi.fn(async (): Promise<void> => {
      throw undefined;
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
    await expect(action).rejects.toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push environment file: Unknown error (undefined)',
    );
  });

  it('Should_LogAwsSdkError_When_AwsErrorWithNameIsThrown', async () => {
    // Arrange
    const awsSdkError = {
      name: 'TooManyUpdates',
      message: 'Rate exceeded',
      $fault: 'client',
    };
    mockSecretProvider.setSecret = vi.fn(async (): Promise<void> => {
      throw awsSdkError;
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
    await expect(action).rejects.toEqual(awsSdkError);
    // Should retry 5 times (maxRetries) + initial attempt = 6 total
    expect(mockSecretProvider.setSecret).toHaveBeenCalledTimes(6);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push environment file: TooManyUpdates: Rate exceeded',
    );
  });

  it('Should_RetryAndSucceed_When_ThrottlingErrorIsTemporary', async () => {
    // Arrange
    let attemptCount = 0;
    const throttlingError = {
      name: 'TooManyUpdates',
      message: 'Rate exceeded',
      $fault: 'client',
    };

    mockSecretProvider.setSecret = vi.fn(async (): Promise<void> => {
      attemptCount++;
      if (attemptCount <= 2) {
        throw throttlingError;
      }
      // Succeeds on the 3rd attempt
    });

    mockVariableStore.getMapping.mockResolvedValue({
      TEST_ENV_VAR: '/path/to/ssm/test',
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
      TEST_ENV_VAR: 'test-value',
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockSecretProvider.setSecret).toHaveBeenCalledTimes(3); // 2 failures + 1 success
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Successfully pushed environment variables'),
    );
  });

  it('Should_ProcessAllVariablesWithRetry_When_OneVariableFails', async () => {
    // Arrange
    mockSecretProvider.setSecret = vi.fn(
      async (path: string): Promise<void> => {
        if (path === '/path/to/ssm/failing') {
          throw new Error('AWS SSM error');
        }
      },
    );

    mockVariableStore.getMapping.mockResolvedValue({
      VAR_ONE: '/path/to/ssm/one',
      VAR_TWO: '/path/to/ssm/two',
      FAILING_VAR: '/path/to/ssm/failing',
      VAR_THREE: '/path/to/ssm/three',
    });

    mockVariableStore.getEnvironment.mockResolvedValue({
      VAR_ONE: 'value-one',
      VAR_TWO: 'value-two',
      FAILING_VAR: 'value-failing',
      VAR_THREE: 'value-three',
    });

    const command = PushEnvToSsmCommand.create(mockMapPath, mockEnvFilePath);

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action).rejects.toThrow('AWS SSM error');
    // With parallel processing, all variables are attempted (including the failing one)
    expect(mockSecretProvider.setSecret).toHaveBeenCalledTimes(4);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push environment file: AWS SSM error',
    );
  });
});
