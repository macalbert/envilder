import type { Environment } from 'aws-cdk-lib';
import { App } from 'aws-cdk-lib';
import { DeployInfrastructureHandler } from '../../../../../src/iac/config/application/deployInfrastructure/deployInfrastructureHandler';
import type { IDeploymentRequest } from '../../../../../src/iac/config/application/deployInfrastructure/models/deploymentRequest';
import { AppEnvironment } from '../../../../../src/iac/config/domain/model/appEnvironment';
import { ConfigValidationError } from '../../../../../src/iac/config/infrastructure/utilities/errors';

// Mock AWS infrastructure (CDK Stacks)
jest.mock('../../../../../src/iac/aws/website/staticWebsiteStack');

describe('DeployInfrastructureUseCase', () => {
  let app: App;
  let envFromCli: Environment;
  let iacConfig: IDeploymentRequest;
  let orchestrator: DeployInfrastructureHandler;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    app = new App({ outdir: '/tmp/cdk.out' });
    jest.spyOn(app, 'synth').mockImplementation();

    envFromCli = {
      region: 'us-east-1',
      account: '123456789012',
    };

    iacConfig = createValidConfig();

    orchestrator = new DeployInfrastructureHandler(app, envFromCli, iacConfig);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  function createValidConfig(): IDeploymentRequest {
    return {
      repoName: 'test-repo',
      branch: 'main',
      environment: AppEnvironment.Production,
      domain: {
        name: 'example.com',
        certificateId: 'cert-123456',
        hostedZoneId: 'Z123456789',
      },
      stacks: {
        frontend: {
          staticWebsites: [],
        },
      },
    };
  }

  describe('run', () => {
    it('Should_CompleteDeploymentSuccessfully_When_ConfigIsValid', () => {
      // Arrange - default setup from beforeEach

      // Act
      orchestrator.run();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[test-repo]'),
      );
    });
  });

  describe('getProjectPathResolver', () => {
    it('Should_ReturnProjectPathResolver_When_Called', () => {
      // Arrange - default setup from beforeEach

      // Act
      const actual = orchestrator.getProjectPathResolver();

      // Assert
      expect(actual).toBeDefined();
      expect(actual.getRootPath).toBeDefined();
      expect(actual.resolveFullPath).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('Should_LogError_When_ValidationFails', () => {
      // Arrange
      const invalidConfig: IDeploymentRequest = {
        ...iacConfig,
        repoName: '',
      };
      const invalidOrchestrator = new DeployInfrastructureHandler(
        app,
        envFromCli,
        invalidConfig,
      );

      // Act
      const action = () => invalidOrchestrator.run();

      // Assert
      expect(action).toThrow(ConfigValidationError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error:'),
      );
    });
  });
});
