import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PushSingleVariableCommand } from '../../../../src/envilder/application/pushSingleVariable/PushSingleVariableCommand';
import { PushSingleVariableCommandHandler } from '../../../../src/envilder/application/pushSingleVariable/PushSingleVariableCommandHandler';
import type { ILogger } from '../../../../src/envilder/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/envilder/domain/ports/ISecretProvider';

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
    const sut = new PushSingleVariableCommandHandler(
      mocks.mockSecretProvider,
      mocks.mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleVariableCommand.create(key, value, ssmPath);

    // Act
    await sut.handle(command);

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

    const sut = new PushSingleVariableCommandHandler(
      errorMocks.mockSecretProvider,
      errorMocks.mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleVariableCommand.create(key, value, ssmPath);

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(errorMocks.mockError);
    expect(errorMocks.mockLogger.error).toHaveBeenCalledWith(
      'Failed to push variable to SSM: Failed to push variable',
    );
  });
});
