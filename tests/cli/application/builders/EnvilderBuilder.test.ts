import { describe, expect, it } from 'vitest';
import { EnvilderBuilder } from '../../../../src/cli/application/builders/EnvilderBuilder';
import { ConsoleLogger } from '../../../../src/cli/infrastructure/ConsoleLogger.js';
import type { IEnvFileManager } from '../../../../src/cli/domain/ports/IEnvFileManager';

describe('EnvilderBuilder', () => {
  it('Should_ReturnInstance_When_NoProfileAreProvided', () => {
    // Act
    const sut = EnvilderBuilder.build()
      .withConsoleLogger()
      .withDefaultFileManager()
      .withAwsProvider()
      .create();

    // Assert
    expect(sut).toBeDefined();
    expect(typeof sut.run).toBe('function');
  });

  it('Should_ReturnInstance_When_DefaultProfileIsProvided', () => {
    // Arrange
    const profile = 'default';

    // Act
    const actual = EnvilderBuilder.build()
      .withConsoleLogger()
      .withDefaultFileManager()
      .withAwsProvider(profile)
      .create();

    // Assert
    expect(actual).toBeDefined();
    expect(typeof actual.run).toBe('function');
  });

  it('Should_NotThrowError_When_InvalidCustomProfileIsProvided', () => {
    // Arrange
    const invalidProfile = 'non-existent-profile';

    // Act
    const action = () =>
      EnvilderBuilder.build()
        .withConsoleLogger()
        .withDefaultFileManager()
        .withAwsProvider(invalidProfile)
        .create();

    // Assert
    expect(action).not.toThrow();
  });

  it('Should_ThrowError_When_ProviderIsMissing', () => {
    // Act
    const action = () =>
      EnvilderBuilder.build().withDefaultFileManager().create();

    // Assert
    expect(action).toThrow('Secret provider must be specified');
  });

  it('Should_ThrowError_When_FileManagerIsMissing', () => {
    // Arrange
    const mockProvider = { getSecret: async () => 'value' };

    // Act
    const action = () =>
      EnvilderBuilder.build().withProvider(mockProvider).create();

    // Assert
    expect(action).toThrow('Env file manager must be specified');
  });

  it('Should_UseCustomEnvFileManager_When_WithEnvFileManagerIsCalled', () => {
    // Arrange
    const mockFileManager: IEnvFileManager = {
      loadMapFile: async () => ({}),
      loadEnvFile: async () => ({}),
      saveEnvFile: async () => {},
    };
    const mockProvider = { getSecret: async () => 'value' };

    // Act
    const sut = EnvilderBuilder.build()
      .withEnvFileManager(mockFileManager)
      .withConsoleLogger()
      .withProvider(mockProvider)
      .create();

    // Assert
    expect(sut).toBeDefined();
    expect(typeof sut.run).toBe('function');
  });
});
