import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { Startup } from '../../../src/apps/gha/Startup.js';
import type { DispatchActionCommandHandler } from '../../../src/envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { ILogger } from '../../../src/envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../../src/envilder/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../../src/envilder/domain/ports/IVariableStore.js';
import { AzureKeyVaultSecretProvider } from '../../../src/envilder/infrastructure/azure/AzureKeyVaultSecretProvider.js';
import { TYPES } from '../../../src/envilder/types.js';

describe('Startup', () => {
  let startup: Startup;

  beforeEach(() => {
    startup = Startup.build();
  });

  it('Should_ResolveAllServices_When_Configured', () => {
    // Arrange
    const sut = startup.configureServices().configureInfrastructure();

    // Act
    const container = sut.create();

    // Assert
    expect(() =>
      container.get<DispatchActionCommandHandler>(
        TYPES.DispatchActionCommandHandler,
      ),
    ).not.toThrow();
    expect(() => container.get<ILogger>(TYPES.ILogger)).not.toThrow();
    expect(() =>
      container.get<ISecretProvider>(TYPES.ISecretProvider),
    ).not.toThrow();
    expect(() =>
      container.get<IVariableStore>(TYPES.IVariableStore),
    ).not.toThrow();
  });

  it('Should_ResolveAllServices_When_AzureProviderConfigured', () => {
    // Arrange
    const config = {
      provider: 'azure',
      vaultUrl: 'https://test-vault.vault.azure.net',
    };

    // Act
    const sut = startup.configureServices().configureInfrastructure(config);
    const container = sut.create();
    const secretProvider = container.get<ISecretProvider>(
      TYPES.ISecretProvider,
    );

    // Assert
    expect(secretProvider).toBeInstanceOf(AzureKeyVaultSecretProvider);
  });

  it('Should_ThrowError_When_AzureProviderSelectedButVaultUrlMissing', () => {
    // Arrange
    const config = { provider: 'azure' };

    // Act
    const action = () =>
      startup.configureServices().configureInfrastructure(config);

    // Assert
    expect(action).toThrow('vaultUrl is required when using Azure provider');
  });

  it('Should_ThrowError_When_AzureVaultUrlIsNotHttps', () => {
    // Arrange
    const config = {
      provider: 'azure',
      vaultUrl: 'http://test-vault.vault.azure.net',
    };

    // Act
    const action = () =>
      startup.configureServices().configureInfrastructure(config);

    // Assert
    expect(action).toThrow('vaultUrl must use https:// protocol');
  });

  it('Should_ThrowError_When_AzureVaultUrlHostIsNotAzure', () => {
    // Arrange
    const config = {
      provider: 'azure',
      vaultUrl: 'https://evil-server.example.com',
    };

    // Act
    const action = () =>
      startup.configureServices().configureInfrastructure(config);

    // Assert
    expect(action).toThrow('vaultUrl hostname must end with one of');
  });
});
