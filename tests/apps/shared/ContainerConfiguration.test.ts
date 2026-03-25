import 'reflect-metadata';
import { Container } from 'inversify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureInfrastructureServices } from '../../../src/apps/shared/ContainerConfiguration.js';

describe('configureInfrastructureServices', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it('Should_LogWarning_When_ProfileIsSetWithAzureProvider', () => {
    // Arrange
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    configureInfrastructureServices(container, {
      provider: 'azure',
      vaultUrl: 'https://my-vault.vault.azure.net',
      profile: 'myprofile',
    });

    // Assert
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '--profile is only supported with the aws provider',
      ),
    );
    warnSpy.mockRestore();
  });

  it('Should_NotLogWarning_When_ProfileIsSetWithAwsProvider', () => {
    // Arrange
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    configureInfrastructureServices(container, {
      provider: 'aws',
      profile: 'myprofile',
    });

    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('Should_NotLogWarning_When_ProfileIsNotSet', () => {
    // Arrange
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    configureInfrastructureServices(container, {
      provider: 'azure',
      vaultUrl: 'https://my-vault.vault.azure.net',
    });

    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
