import { App } from 'aws-cdk-lib';
import type { IDeploymentRequest } from '../../../../../src/config/application/deployInfrastructure/models/deploymentRequest';
import { AppEnvironment } from '../../../../../src/config/domain/model/appEnvironment';
import { FrontendBuilder } from '../../../../../src/config/domain/builders/frontendBuilder';
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
      },
    };
  }

  describe('createStackParts', () => {
    test('Should_CreateFrontendBuilder_When_FrontendConfigProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(FrontendBuilder);
    });

    test('Should_ReturnEmptyArray_When_NoFrontendConfigProvided', () => {
      // Arrange
      const app = new App();
      const config = createValidConfig();
      // biome-ignore lint/suspicious/noExplicitAny: testing undefined config
      config.stacks.frontend = undefined as any;

      // Act
      const result = StackBuilderFactory.createStackParts(app, config);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
