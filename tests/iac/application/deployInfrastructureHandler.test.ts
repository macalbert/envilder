import type { Environment } from 'aws-cdk-lib';
import { App } from 'aws-cdk-lib';
import { DeployInfrastructureHandler } from '../../../src/iac/application/deployInfrastructureHandler';
import { ConfigValidationError } from '../../../src/iac/domain/errors';
import { AppEnvironment } from '../../../src/iac/domain/model/appEnvironment';
import type { IDeploymentConfig } from '../../../src/iac/domain/model/deploymentConfig';
import type { ILogger } from '../../../src/iac/domain/ports/iLogger';
import type { IProjectPath } from '../../../src/iac/domain/ports/iProjectPath';

jest.mock('../../../src/iac/infrastructure/stacks/staticWebsiteStack');

describe('DeployInfrastructureHandler', () => {
  let app: App;
  let envFromCli: Environment;
  let config: IDeploymentConfig;
  let handler: DeployInfrastructureHandler;
  let mockLogger: ILogger;
  let mockProjectPath: IProjectPath;

  beforeEach(() => {
    jest.clearAllMocks();

    app = new App({ outdir: '/tmp/cdk.out' });
    jest.spyOn(app, 'synth').mockImplementation();

    envFromCli = {
      region: 'us-east-1',
      account: '123456789012',
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      table: jest.fn(),
    };

    mockProjectPath = {
      getRootPath: jest.fn().mockReturnValue('/root'),
      resolveFullPath: jest.fn((p: string) => `/root/${p}`),
    };

    config = createValidConfig();

    handler = new DeployInfrastructureHandler(
      app,
      envFromCli,
      config,
      mockLogger,
      mockProjectPath,
    );
  });

  function createValidConfig(): IDeploymentConfig {
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
      handler.run();

      // Assert
      expect(mockLogger.table).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('Should_LogError_When_ValidationFails', () => {
      // Arrange
      const invalidConfig: IDeploymentConfig = {
        ...config,
        repoName: '',
      };
      const invalidHandler = new DeployInfrastructureHandler(
        app,
        envFromCli,
        invalidConfig,
        mockLogger,
        mockProjectPath,
      );

      // Act
      const action = () => invalidHandler.run();

      // Assert
      expect(action).toThrow(ConfigValidationError);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
