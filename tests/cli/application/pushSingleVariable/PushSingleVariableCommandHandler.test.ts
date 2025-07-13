import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PushSingleVariableCommand } from '../../../../src/cli/application/pushSingleVariable/PushSingleVariableCommand';
import { PushSingleVariableCommandHandler } from '../../../../src/cli/application/pushSingleVariable/PushSingleVariableCommandHandler';
import type { ILogger } from '../../../../src/cli/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/cli/domain/ports/ISecretProvider';

function createMocks(throwError = false) {
  const mockError = new Error('Failed to push variable');

  const mockSecretProvider: ISecretProvider = {
    getSecret: vi.fn(),
    setSecret: throwError
      ? vi.fn(async (): Promise<void> => {
          throw mockError;
        })
      : vi.fn(async (): Promise<void> => {}),
  };

  const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  return { mockSecretProvider, mockLogger, mockError };
}

describe('PushSingleVariableCommandHandler', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
  });

  it('Should_SetSecret_When_PushingSingleVariable', async () => {
    // Arrange
    const handler = new PushSingleVariableCommandHandler(
      mocks.mockSecretProvider,
      mocks.mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleVariableCommand.create(key, value, ssmPath);

    // Act
    await handler.handle(command);

    // Assert
    expect(mocks.mockSecretProvider.setSecret).toHaveBeenCalledWith(
      ssmPath,
      value,
    );
    expect(mocks.mockLogger.info).toHaveBeenCalledWith(
      `Pushed ${key} to AWS SSM at path ${ssmPath}`,
    );
  });

  it('Should_ThrowError_When_PushingSingleVariableFails', async () => {
    // Arrange
    const errorMocks = createMocks(true);

    const handler = new PushSingleVariableCommandHandler(
      errorMocks.mockSecretProvider,
      errorMocks.mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleVariableCommand.create(key, value, ssmPath);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow(errorMocks.mockError);
    expect(errorMocks.mockLogger.error).toHaveBeenCalledWith(
      'Failed to push variable to SSM: Failed to push variable',
    );
  });
});
