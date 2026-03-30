import 'reflect-metadata';
import { Container } from 'inversify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureInfrastructureServices } from '../../../../src/envilder/apps/shared/ContainerConfiguration.js';
import { InvalidArgumentError } from '../../../../src/envilder/core/domain/errors/DomainErrors.js';
import type { ILogger } from '../../../../src/envilder/core/domain/ports/ILogger.js';
import { TYPES } from '../../../../src/envilder/core/types.js';

describe('configureInfrastructureServices', () => {
  let container: Container;
  let mockLogger: ILogger;

  beforeEach(() => {
    container = new Container();
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    container.bind<ILogger>(TYPES.ILogger).toConstantValue(mockLogger);
  });

  it('Should_LogWarning_When_ProfileIsSetWithAzureProvider', () => {
    // Arrange
    const config = {
      provider: 'azure',
      vaultUrl: 'https://my-vault.vault.azure.net',
      profile: 'myprofile',
    };

    // Act
    configureInfrastructureServices(container, config);

    // Assert
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '--profile is only supported with the aws provider',
      ),
    );
  });

  it('Should_NotLogWarning_When_ProfileIsSetWithAwsProvider', () => {
    // Arrange
    const config = {
      provider: 'aws',
      profile: 'myprofile',
    };

    // Act
    configureInfrastructureServices(container, config);

    // Assert
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('Should_NotLogWarning_When_ProfileIsNotSet', () => {
    // Arrange
    const config = {
      provider: 'azure',
      vaultUrl: 'https://my-vault.vault.azure.net',
    };

    // Act
    configureInfrastructureServices(container, config);

    // Assert
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('Should_ThrowInvalidArgumentError_When_UnsupportedProviderSelected', () => {
    // Arrange
    const unsupportedConfig = { provider: 'hashicorp' };

    // Act
    const act = () =>
      configureInfrastructureServices(container, unsupportedConfig);

    // Assert
    expect(act).toThrow(InvalidArgumentError);
    expect(act).toThrow('Unsupported provider');
  });
});
