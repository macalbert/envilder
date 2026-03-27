import { App } from 'aws-cdk-lib';
import type { IDeploymentRequest } from '../../../../../src/config/application/deployInfrastructure/models/deploymentRequest';
import { AppEnvironment } from '../../../../../src/config/domain/model/appEnvironment';
import { FrontendBuilder } from '../../../../../src/config/domain/builders/frontendBuilder';
import { SharedBuilder } from '../../../../../src/config/domain/builders/sharedBuilder';
import { StackBuilderFactory } from '../../../../../src/config/domain/builders/factories/stackBuilderFactory';

describe('StackBuilderFactory', () => {
  function createValidConfig(): IDeploymentRequest {
    return {
      repoName: 'test-repo',
      vpcId: 'vpc-12345678',
      branch: 'main',
      environment: AppEnvironment.Production,
      domain: {
        name: 'example.com',
        certificateId: 'cert-123',
        hostedZoneId: 'Z123',
      },
      stacks: {
        frontend: {
          staticWebsites: [],
        },
        shared: {
          pipeline: [],
        },
      },
    };
  }

  describe('createStackParts', () => {
    test('Should_CreateBothStackParts_When_AllConfigsProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(FrontendBuilder);
      expect(result[1]).toBeInstanceOf(SharedBuilder);
    });

    test('Should_CreateFrontendBuilder_When_FrontendConfigProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      const frontendBuilder = result.find(
        (part) => part instanceof FrontendBuilder,
      );
      expect(frontendBuilder).toBeDefined();
      expect(frontendBuilder).toBeInstanceOf(FrontendBuilder);
    });

    test('Should_CreateSharedBuilder_When_SharedConfigProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      const sharedBuilder = result.find(
        (part) => part instanceof SharedBuilder,
      );
      expect(sharedBuilder).toBeDefined();
      expect(sharedBuilder).toBeInstanceOf(SharedBuilder);
    });

    test('Should_CreateOnlyFrontendBuilder_When_OnlyFrontendConfigProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();
      // biome-ignore lint/suspicious/noExplicitAny: testing undefined config
      config.stacks.shared = undefined as any;

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(FrontendBuilder);
    });

    test('Should_CreateOnlySharedBuilder_When_OnlySharedConfigProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();
      // biome-ignore lint/suspicious/noExplicitAny: testing undefined config
      config.stacks.frontend = undefined as any;

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SharedBuilder);
    });

    test('Should_ReturnEmptyArray_When_NoStackConfigsProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();
      // biome-ignore lint/suspicious/noExplicitAny: testing undefined config
      config.stacks.frontend = undefined as any;
      // biome-ignore lint/suspicious/noExplicitAny: testing undefined config
      config.stacks.shared = undefined as any;

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
