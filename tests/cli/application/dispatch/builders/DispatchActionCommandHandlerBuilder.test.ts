import { describe, expect, it, vi } from 'vitest';
import { DispatchActionCommandHandlerBuilder } from '../../../../../src/cli/application/dispatch/builders/DispatchActionCommandHandlerBuilder';
import type { IEnvFileManager } from '../../../../../src/cli/domain/ports/IEnvFileManager';
import type { ILogger } from '../../../../../src/cli/domain/ports/ILogger';
import type { ISecretProvider } from '../../../../../src/cli/domain/ports/ISecretProvider';

describe('DispatchActionCommandHandlerBuilder', () => {
  const mockSecretProvider: ISecretProvider = {
    getSecret: vi.fn(),
    setSecret: vi.fn(),
  };

  const mockEnvFileManager: IEnvFileManager = {
    loadMapFile: vi.fn(),
    loadEnvFile: vi.fn(),
    saveEnvFile: vi.fn(),
  };

  const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  it('Should_CreateDispatchActionCommandHandler_When_AllDependenciesAreProvided', () => {
    // Arrange
    const sut = DispatchActionCommandHandlerBuilder.build()
      .withProvider(mockSecretProvider)
      .withEnvFileManager(mockEnvFileManager)
      .withLogger(mockLogger);

    // Act
    const actual = sut.create();

    // Assert
    expect(actual).toBeDefined();
  });

  it('Should_ThrowError_When_ProviderIsMissing', () => {
    // Arrange
    const sut = DispatchActionCommandHandlerBuilder.build()
      .withEnvFileManager(mockEnvFileManager)
      .withLogger(mockLogger);

    // Act
    const action = () => sut.create();

    // Assert
    expect(action).toThrow('Secret provider is required');
  });

  it('Should_ThrowError_When_EnvFileManagerIsMissing', () => {
    // Arrange
    const sut = DispatchActionCommandHandlerBuilder.build()
      .withProvider(mockSecretProvider)
      .withLogger(mockLogger);

    // Act
    const action = () => sut.create();

    // Assert
    expect(action).toThrow('Environment file manager is required');
  });

  it('Should_ThrowError_When_LoggerIsMissing', () => {
    // Arrange
    const sut = DispatchActionCommandHandlerBuilder.build()
      .withProvider(mockSecretProvider)
      .withEnvFileManager(mockEnvFileManager);

    // Act
    const action = () => sut.create();

    // Assert
    expect(action).toThrow('Logger is required');
  });
});
