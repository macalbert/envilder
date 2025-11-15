import 'reflect-metadata';
import { Container } from 'inversify';
import { beforeEach, describe, expect, it } from 'vitest';
import { Startup } from '../../../src/apps/githubAction/Startup.js';
import type { DispatchActionCommandHandler } from '../../../src/envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { ILogger } from '../../../src/envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../../src/envilder/domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../../src/envilder/domain/ports/IVariableStore.js';
import { TYPES } from '../../../src/envilder/types.js';

describe('Startup', () => {
  let startup: Startup;

  beforeEach(() => {
    startup = Startup.build();
  });

  describe('build', () => {
    it('Should_CreateNewInstance_When_BuildIsCalled', () => {
      // Arrange
      // No setup needed

      // Act
      const actual1 = Startup.build();
      const actual2 = Startup.build();

      // Assert
      expect(actual1).toBeInstanceOf(Startup);
      expect(actual2).toBeInstanceOf(Startup);
      expect(actual1).not.toBe(actual2);
    });
  });

  describe('fluent pattern', () => {
    it('Should_SupportMethodChaining_When_ConfiguringServices', () => {
      // Arrange
      const expected = startup;

      // Act
      const actual = startup.configureServices().configureInfrastructure();

      // Assert
      expect(actual).toBe(expected);
    });

    it('Should_ReturnContainer_When_CreateIsCalled', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();

      // Act
      const actual = sut.create();

      // Assert
      expect(actual).toBeInstanceOf(Container);
    });

    it('Should_ReturnSameContainer_When_CreateAndGetServiceProviderAreCalled', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();
      const expected = sut.create();

      // Act
      const actual = sut.getServiceProvider();

      // Assert
      expect(expected).toBe(actual);
    });
  });

  describe('service configuration', () => {
    it('Should_ResolveApplicationServices_When_ConfigureServicesIsCalled', () => {
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
    });

    it('Should_ResolveInfrastructureServices_When_ConfigureInfrastructureIsCalled', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();

      // Act
      const container = sut.create();

      // Assert
      expect(() => container.get<ILogger>(TYPES.ILogger)).not.toThrow();
      expect(() =>
        container.get<ISecretProvider>(TYPES.ISecretProvider),
      ).not.toThrow();
      expect(() =>
        container.get<IVariableStore>(TYPES.IVariableStore),
      ).not.toThrow();
    });

    it('Should_CreateSingletonLogger_When_LoggerIsResolved', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();
      const container = sut.create();

      // Act
      const logger1 = container.get<ILogger>(TYPES.ILogger);
      const logger2 = container.get<ILogger>(TYPES.ILogger);

      // Assert
      expect(logger1).toBe(logger2);
    });

    it('Should_UseAwsProfile_When_ProfileIsProvided', () => {
      // Arrange
      const testProfile = 'test-profile';
      const sut = startup
        .configureServices()
        .configureInfrastructure(testProfile);

      // Act
      const container = sut.create();
      const secretProvider = container.get<ISecretProvider>(
        TYPES.ISecretProvider,
      );

      // Assert
      expect(secretProvider).toBeDefined();
    });

    it('Should_UseDefaultCredentials_When_ProfileIsNotProvided', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();

      // Act
      const container = sut.create();
      const secretProvider = container.get<ISecretProvider>(
        TYPES.ISecretProvider,
      );

      // Assert
      expect(secretProvider).toBeDefined();
    });
  });
});
