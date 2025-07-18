import 'reflect-metadata';
import { Container } from 'inversify';
import { beforeEach, describe, expect, it } from 'vitest';

import { Startup } from '../../../src/apps/cli/Startup.js';
import type { DispatchActionCommandHandler } from '../../../src/envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { PullSsmToEnvCommandHandler } from '../../../src/envilder/application/pullSsmToEnv/PullSsmToEnvCommandHandler.js';
import type { PushEnvToSsmCommandHandler } from '../../../src/envilder/application/pushEnvToSsm/PushEnvToSsmCommandHandler.js';
import type { PushSingleCommandHandler } from '../../../src/envilder/application/pushSingle/PushSingleCommandHandler.js';
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
      const instance1 = Startup.build();
      const instance2 = Startup.build();

      // Assert
      expect(instance1).toBeInstanceOf(Startup);
      expect(instance2).toBeInstanceOf(Startup);
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('fluent pattern', () => {
    it('Should_SupportMethodChaining_When_ConfiguringServices', () => {
      // Arrange
      // startup is initialized in beforeEach

      // Act
      const result = startup.configureServices().configureInfrastructure();

      // Assert
      expect(result).toBe(startup);
    });

    it('Should_ReturnContainer_When_CreateIsCalled', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const container = configuredStartup.create();

      // Assert
      expect(container).toBeInstanceOf(Container);
    });

    it('Should_ReturnSameContainer_When_CreateAndGetServiceProviderAreCalled', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const containerFromCreate = configuredStartup.create();
      const containerFromGetServiceProvider =
        configuredStartup.getServiceProvider();

      // Assert
      expect(containerFromCreate).toBe(containerFromGetServiceProvider);
    });
  });

  describe('service configuration', () => {
    it('Should_ConfigureAllApplicationServices_When_ConfigureServicesIsCalled', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const container = configuredStartup.create();

      // Assert
      expect(() =>
        container.get<DispatchActionCommandHandler>(
          TYPES.DispatchActionCommandHandler,
        ),
      ).not.toThrow();
      expect(() =>
        container.get<PullSsmToEnvCommandHandler>(
          TYPES.PullSsmToEnvCommandHandler,
        ),
      ).not.toThrow();
      expect(() =>
        container.get<PushEnvToSsmCommandHandler>(
          TYPES.PushEnvToSsmCommandHandler,
        ),
      ).not.toThrow();
      expect(() =>
        container.get<PushSingleCommandHandler>(TYPES.PushSingleCommandHandler),
      ).not.toThrow();
    });

    it('Should_ConfigureAllInfrastructureServices_When_ConfigureInfrastructureIsCalled', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const container = configuredStartup.create();

      // Assert
      expect(() => container.get<ILogger>(TYPES.ILogger)).not.toThrow();
      expect(() =>
        container.get<IVariableStore>(TYPES.IVariableStore),
      ).not.toThrow();
      expect(() =>
        container.get<ISecretProvider>(TYPES.ISecretProvider),
      ).not.toThrow();
    });

    it('Should_ConfigureServicesWithCorrectScope_When_ServicesAreResolved', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const container = configuredStartup.create();
      const handler1 = container.get<DispatchActionCommandHandler>(
        TYPES.DispatchActionCommandHandler,
      );
      const handler2 = container.get<DispatchActionCommandHandler>(
        TYPES.DispatchActionCommandHandler,
      );
      const logger1 = container.get<ILogger>(TYPES.ILogger);
      const logger2 = container.get<ILogger>(TYPES.ILogger);
      const store1 = container.get<IVariableStore>(TYPES.IVariableStore);
      const store2 = container.get<IVariableStore>(TYPES.IVariableStore);

      // Assert
      // Application services should be transient (new instance each time)
      expect(handler1).not.toBe(handler2);

      // Infrastructure services should be singleton (same instance)
      expect(logger1).toBe(logger2);
      expect(store1).toBe(store2);
    });

    it('Should_ConfigureAwsSsmWithProfile_When_ProfileIsProvided', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure('test-profile');

      // Act
      const container = configuredStartup.create();
      const secretProvider = container.get<ISecretProvider>(
        TYPES.ISecretProvider,
      );

      // Assert
      expect(secretProvider).toBeDefined();
    });

    it('Should_ConfigureAwsSsmWithoutProfile_When_ProfileIsNotProvided', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const container = configuredStartup.create();
      const secretProvider = container.get<ISecretProvider>(
        TYPES.ISecretProvider,
      );

      // Assert
      expect(secretProvider).toBeDefined();
    });
  });

  describe('integration', () => {
    it('Should_ResolveCompleteObjectGraph_When_AllServicesAreConfigured', () => {
      // Arrange
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const container = configuredStartup.create();
      const dispatchHandler = container.get<DispatchActionCommandHandler>(
        TYPES.DispatchActionCommandHandler,
      );

      // Assert
      // This tests the complete dependency graph resolution
      expect(dispatchHandler).toBeDefined();

      // Verify that all dependencies are properly injected
      expect(() => {
        container.get<PullSsmToEnvCommandHandler>(
          TYPES.PullSsmToEnvCommandHandler,
        );
        container.get<PushEnvToSsmCommandHandler>(
          TYPES.PushEnvToSsmCommandHandler,
        );
        container.get<PushSingleCommandHandler>(TYPES.PushSingleCommandHandler);
      }).not.toThrow();
    });

    it('Should_ThrowError_When_ServicesAreNotConfigured', () => {
      // Arrange
      // No configuration needed - testing unconfigured startup

      // Act
      const container = startup.create();

      // Assert
      expect(() => container.get<ILogger>(TYPES.ILogger)).toThrow();
    });

    it('Should_ThrowError_When_OnlyServicesAreConfigured', () => {
      // Arrange
      const partiallyConfiguredStartup = startup.configureServices();

      // Act
      const container = partiallyConfiguredStartup.create();

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
      const configuredStartup = startup
        .configureInfrastructure()
        .configureServices();

      // Act
      const container = configuredStartup.create();

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
      const configuredStartup = startup
        .configureServices()
        .configureInfrastructure();

      // Act
      const serviceProvider = configuredStartup.getServiceProvider();
      const logger = serviceProvider.get<ILogger>(TYPES.ILogger);

      // Assert
      expect(serviceProvider).toBeInstanceOf(Container);
      expect(logger).toBeDefined();
    });
  });
});
