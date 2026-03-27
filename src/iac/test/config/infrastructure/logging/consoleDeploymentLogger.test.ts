import { ConsoleDeploymentLogger } from '../../../../src/config/infrastructure/logging/consoleDeploymentLogger';
import type { IDeploymentRequest } from '../../../../src/config/application/deployInfrastructure/models/deploymentRequest';
import type { IProjectPath } from '../../../../src/config/domain/ports/iProjectPath';
import { AppEnvironment } from '../../../../src/config/domain/model/appEnvironment';

describe('ConsoleDeploymentLogger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const createMockConfig = (): IDeploymentRequest => ({
    repoName: 'test-repo',
    branch: 'main',
    vpcId: 'vpc-123',
    environment: AppEnvironment.Production,
    domain: {
      name: 'example.com',
      certificateId: 'cert-123',
      hostedZoneId: 'zone-123',
    },
    stacks: {
      frontend: {
        staticWebsites: [
          {
            name: 'Website',
            subdomain: 'www.test',
            projectPath: 'apps/website',
          },
        ],
      },
      shared: {},
    },
  });

  const createMockPathResolver = (): IProjectPath => ({
    getRootPath: () => '/root/project',
    resolveFullPath: (path: string) => `/root/project/${path}`,
    generateDockerfileDest: (path: string) => `${path}/Dockerfile`,
  });

  describe('displayDeploymentInfo', () => {
    it('Should_LogAllStacksInformation_When_Called', () => {
      const logger = new ConsoleDeploymentLogger();
      const config = createMockConfig();
      const pathResolver = createMockPathResolver();

      logger.displayDeploymentInfo(
        config,
        pathResolver,
        'us-east-1',
        '123456789012',
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[test-repo]'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Region: us-east-1');
      expect(consoleLogSpy).toHaveBeenCalledWith('Account: ***9012');
    });
  });

  describe('logRepositoryInfo', () => {
    it('Should_LogRepositoryUrl_When_Called', () => {
      const logger = new ConsoleDeploymentLogger();

      logger.logRepositoryInfo('test-repo', 'feature-branch');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '🔌 Repository source https://github.com/macalbert/test-repo/tree/feature-branch',
        ),
      );
    });
  });

  describe('logError', () => {
    it('Should_LogFormattedError_When_Called', () => {
      const logger = new ConsoleDeploymentLogger();
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at test.js:1:1';

      logger.logError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error: Test error'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
    });
  });
});
