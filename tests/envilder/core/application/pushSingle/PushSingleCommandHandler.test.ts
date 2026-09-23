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
      expect.stringContaining('PUSHING SECRET'),
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('TEST_VAR'),
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('**************est'),
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('SECRET PUSHED'),
    );
  });

  it('Should_LogRuleSeparator_When_PushingSingleVariable', async () => {
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
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('\u2501'),
    );
  });

  it('Should_WrapOutputWithBlankLines_When_PushingSingleVariable', async () => {
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
    const calls = vi.mocked(mockLogger.info).mock.calls.map(([msg]) => msg);
    expect(calls[0].startsWith('\n')).toBe(true);
    expect(calls[calls.length - 1].endsWith('\n')).toBe(true);
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
