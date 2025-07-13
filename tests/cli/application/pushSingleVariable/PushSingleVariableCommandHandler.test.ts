import { describe, expect, it, vi } from 'vitest';
import { PushSingleVariableCommand } from '../../../../src/cli/application/pushSingleVariable/PushSingleVariableCommand';
import { PushSingleVariableCommandHandler } from '../../../../src/cli/application/pushSingleVariable/PushSingleVariableCommandHandler';
import type { ILogger } from '../../../../src/cli/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../src/cli/domain/ports/ISecretProvider';

describe('PushSingleVariableCommandHandler', () => {
  it('Should_SetSecret_When_PushingSingleVariable', async () => {
    // Arrange
    const mockSecretProvider: ISecretProvider = {
      getSecret: vi.fn(),
      setSecret: vi.fn(async (): Promise<void> => {}),
    };

    const mockLogger: ILogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const handler = new PushSingleVariableCommandHandler(
      mockSecretProvider,
      mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleVariableCommand.create(key, value, ssmPath);

    // Act
    await handler.handle(command);

    // Assert
    expect(mockSecretProvider.setSecret).toHaveBeenCalledWith(ssmPath, value);
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Pushed ${key} to AWS SSM at path ${ssmPath}`,
    );
  });

  it('Should_ThrowError_When_PushingSingleVariableFails', async () => {
    // Arrange
    const mockError = new Error('Failed to push variable');

    const mockSecretProvider: ISecretProvider = {
      getSecret: vi.fn(),
      setSecret: vi.fn(async (): Promise<void> => {
        throw mockError;
      }),
    };

    const mockLogger: ILogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const handler = new PushSingleVariableCommandHandler(
      mockSecretProvider,
      mockLogger,
    );

    const key = 'TEST_VAR';
    const value = 'test-value';
    const ssmPath = '/path/to/ssm/test';
    const command = PushSingleVariableCommand.create(key, value, ssmPath);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow(mockError);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to push variable to SSM: Failed to push variable',
    );
  });
});
