import { FrontendBuilder } from '../../../../src/config/domain/builders/frontendBuilder';
import type { FrontendBuilderProps } from '../../../../src/config/domain/builders/frontendBuilder';
import type { IDeploymentRequest } from '../../../../src/config/application/deployInfrastructure/models/deploymentRequest';
import { AppEnvironment } from '../../../../src/config/domain/model/appEnvironment';
import type { IStackBuildContext } from '../../../../src/config/domain/iStackBuilder';
import { App } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { FileProjectPath } from '../../../../src/config/infrastructure/projectPath/fileProjectPath';

jest.mock('../../../../src/aws/website/staticWebsiteStack');

describe('FrontendBuilder', () => {
  const mockVpc = {} as IVpc;
  const mockEnv = { account: '123456789012', region: 'us-east-1' };

  const createMinimalConfig = (): IDeploymentRequest => ({
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
        staticWebsites: [],
      },
    },
  });

  const createBuilderProps = (
    iacConfig: IDeploymentRequest,
  ): FrontendBuilderProps => ({
    scope: new App(),
    iacConfig,
    stackName: 'test-stack',
    projectPathResolver: new FileProjectPath(iacConfig.repoName),
  });

  const createBuildContext = (): IStackBuildContext => ({
    vpc: mockVpc,
    env: mockEnv,
    environment: AppEnvironment.Production,
  });

  describe('build', () => {
    it('Should_CreateStaticWebsiteStack_When_ValidConfigProvided', () => {
      const config = createMinimalConfig();
      config.stacks.frontend = {
        staticWebsites: [
          {
            name: 'StaticSite',
            subdomain: 'www.test',
            projectPath: 'apps/website',
          },
        ],
      };

      const builder = new FrontendBuilder(createBuilderProps(config));

      const actual = builder.build(createBuildContext());

      expect(actual).toHaveLength(1);
    });

    it('Should_ReturnEmptyArray_When_NoWebsitesConfigured', () => {
      const config = createMinimalConfig();
      const builder = new FrontendBuilder(createBuilderProps(config));

      const actual = builder.build(createBuildContext());

      expect(actual).toEqual([]);
    });

    it('Should_ThrowError_When_MissingRequiredConfig', () => {
      const config = createMinimalConfig();
      delete (config.stacks as { frontend?: unknown }).frontend;

      const action = () => new FrontendBuilder(createBuilderProps(config));

      expect(action).toThrow('Frontend stack configuration is required');
    });
  });
});
