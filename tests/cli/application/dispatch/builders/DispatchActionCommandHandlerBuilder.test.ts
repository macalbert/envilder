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
    // Act
    const actual = DispatchActionCommandHandlerBuilder.build()
      .withProvider(mockSecretProvider)
      .withEnvFileManager(mockEnvFileManager)
      .withLogger(mockLogger)
      .create();

    // Assert
    expect(actual).toBeDefined();
  });

  it('Should_ThrowError_When_ProviderIsMissing', () => {
    // Act
    const actual = DispatchActionCommandHandlerBuilder.build()
      .withEnvFileManager(mockEnvFileManager)
      .withLogger(mockLogger)
      .create();

    // Assert
    expect(actual).toThrow('Provider is required');
  });

  it('Should_ThrowError_When_EnvFileManagerIsMissing', () => {
    // Act
    const actual = DispatchActionCommandHandlerBuilder.build()
      .withProvider(mockSecretProvider)
      .withLogger(mockLogger)
      .create();

    // Assert
    expect(actual).toThrow('EnvFileManager is required');
  });

  it('Should_ThrowError_When_LoggerIsMissing', () => {
    // Act
    const actual = DispatchActionCommandHandlerBuilder.build()
      .withProvider(mockSecretProvider)
      .withEnvFileManager(mockEnvFileManager)
      .create();

    // Assert
    expect(actual).toThrow('Logger is required');
  });
});
