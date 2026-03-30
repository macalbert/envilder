import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PushSingleCommand } from '../../../../../src/envilder/core/application/pushSingle/PushSingleCommand';
import { PushSingleCommandHandler } from '../../../../../src/envilder/core/application/pushSingle/PushSingleCommandHandler';
import type { ILogger } from '../../../../../src/envilder/core/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';

describe('PushSingleCommandHandler', () => {
  let mockSecretProvider: ISecretProvider;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockSecretProvider = {
      getSecret: vi.fn(),
      setSecret: vi.fn(async (): Promise<void> => {}),
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  it('Should_SetSecret_When_PushingSingleVariable', async () => {
    // Arrange
    const sut = new PushSingleCommandHandler(mockSecretProvider, mockLogger);
    const command = PushSingleCommand.create(
      'TEST_VAR',
      'test-value',
      '/path/to/ssm/test',
    );

    // Act
    await sut.handle(command);

    // Assert
    expect(mockSecretProvider.setSecret).toHaveBeenCalledWith(
      '/path/to/ssm/test',
      'test-value',
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Starting push operation for key 'TEST_VAR' to path '**************est'",
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('to secret store at path **************est'),
    );
  });

  it('Should_ThrowError_When_PushingSingleVariableFails', async () => {
    // Arrange
    const mockError = new Error('Failed to push variable');
    mockSecretProvider.setSecret = vi.fn(async (): Promise<void> => {
      throw mockError;
    });
    const sut = new PushSingleCommandHandler(mockSecretProvider, mockLogger);
    const command = PushSingleCommand.create(
      'TEST_VAR',
      'test-value',
      '/path/to/ssm/test',
    );

    // Act
    const action = () => sut.handle(command);

    // Assert
    await expect(action()).rejects.toThrow(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push variable to secret store: Failed to push variable',
    );
  });
});
