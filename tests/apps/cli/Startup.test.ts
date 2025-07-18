import 'reflect-metadata';
import { Container } from 'inversify';
import { beforeEach, describe, expect, it } from 'vitest';

import { Startup } from '../../../src/apps/cli/Startup.js';
import type { DispatchActionCommandHandler } from '../../../src/envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { ILogger } from '../../../src/envilder/domain/ports/ILogger.js';
import type { ISecretProvider } from '../../../src/envilder/domain/ports/ISecretProvider.js';
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
      // Smoke test: verify main entry point can be resolved
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
      // Smoke test: verify core infrastructure can be resolved
      expect(() => container.get<ILogger>(TYPES.ILogger)).not.toThrow();
      expect(() =>
        container.get<ISecretProvider>(TYPES.ISecretProvider),
      ).not.toThrow();
    });

    it('Should_ConfigureAwsSsmWithProfile_When_ProfileIsProvided', () => {
      // Arrange
      const sut = startup
        .configureServices()
        .configureInfrastructure('test-profile');

      // Act
      const container = sut.create();
      const actual = container.get<ISecretProvider>(TYPES.ISecretProvider);

      // Assert
      expect(actual).toBeDefined();
    });

    it('Should_ConfigureAwsSsmWithoutProfile_When_ProfileIsNotProvided', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();

      // Act
      const container = sut.create();
      const actual = container.get<ISecretProvider>(TYPES.ISecretProvider);

      // Assert
      expect(actual).toBeDefined();
    });
  });

  describe('integration', () => {
    it('Should_ResolveMainEntryPoint_When_AllServicesAreConfigured', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();

      // Act
      const container = sut.create();
      const actual = container.get<DispatchActionCommandHandler>(
        TYPES.DispatchActionCommandHandler,
      );

      // Assert
      // This tests that the main entry point can be resolved with all dependencies
      expect(actual).toBeDefined();
    });

    it('Should_ThrowError_When_ServicesAreNotConfigured', () => {
      // Arrange
      const sut = startup;

      // Act
      const container = sut.create();

      // Assert
      expect(() => container.get<ILogger>(TYPES.ILogger)).toThrow();
    });

    it('Should_ThrowError_When_OnlyServicesAreConfigured', () => {
      // Arrange
      const sut = startup.configureServices();

      // Act
      const container = sut.create();

      // Assert
      // Application services depend on infrastructure services
      expect(() =>
        container.get<DispatchActionCommandHandler>(
          TYPES.DispatchActionCommandHandler,
        ),
      ).toThrow();
    });

    it('Should_Work_When_ConfigurationOrderIsReversed', () => {
      // Arrange
      const sut = startup.configureInfrastructure().configureServices();

      // Act
      const container = sut.create();

      // Assert
      // Should work regardless of configuration order
      expect(() =>
        container.get<DispatchActionCommandHandler>(
          TYPES.DispatchActionCommandHandler,
        ),
      ).not.toThrow();
    });
  });

  describe('backward compatibility', () => {
    it('Should_SupportGetServiceProvider_When_LegacyCodeIsUsed', () => {
      // Arrange
      const sut = startup.configureServices().configureInfrastructure();
      
      // Act
      const actual = sut.getServiceProvider();
      
      // Assert
      const logger = actual.get<ILogger>(TYPES.ILogger);
      expect(actual).toBeInstanceOf(Container);
      expect(logger).toBeDefined();
    });
  });
});
