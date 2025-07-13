import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PushSingleCommand } from '../../../../src/envilder/application/pushSingle/PushSingleCommand';
import { PushSingleCommandHandler } from '../../../../src/envilder/application/pushSingle/PushSingleCommandHandler';
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

describe('PushSingleCommandHandler', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
  });

  it('Should_SetSecret_When_PushingSingleVariable', async () => {
    // Arrange
    const sut = new PushSingleCommandHandler(
      mocks.mockSecretProvider,
      mocks.mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleCommand.create(key, value, ssmPath);

    // Act
    await sut.handle(command);

    // Assert
    expect(mocks.mockSecretProvider.setSecret).toHaveBeenCalledWith(
      ssmPath,
      value,
    );
  });

  it('Should_ThrowError_When_PushingSingleVariableFails', async () => {
    // Arrange
    const errorMocks = createMocks(true);

    const sut = new PushSingleCommandHandler(
      errorMocks.mockSecretProvider,
      errorMocks.mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleCommand.create(key, value, ssmPath);

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(errorMocks.mockError);
    expect(errorMocks.mockLogger.error).toHaveBeenCalledWith(
      'Failed to push variable to SSM: Failed to push variable',
    );
  });
});
