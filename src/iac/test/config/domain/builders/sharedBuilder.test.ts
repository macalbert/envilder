import { SharedBuilder } from '../../../../src/config/domain/builders/sharedBuilder';
import type { SharedBuilderProps } from '../../../../src/config/domain/builders/sharedBuilder';
import type { IDeploymentRequest } from '../../../../src/config/application/deployInfrastructure/models/deploymentRequest';
import { AppEnvironment } from '../../../../src/config/domain/model/appEnvironment';
import type { IStackBuildContext } from '../../../../src/config/domain/iStackBuilder';
import { App } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';

jest.mock('../../../../src/aws/developerTools/codepipeline/pipelineStack');

describe('SharedBuilder', () => {
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
      shared: {},
      frontend: { staticWebsites: [] },
    },
  });

  const createBuilderProps = (
    iacConfig: IDeploymentRequest,
  ): SharedBuilderProps => ({
    scope: new App(),
    iacConfig,
    stackName: 'test-stack',
  });

  const createBuildContext = (): IStackBuildContext => ({
    vpc: mockVpc,
    env: mockEnv,
    environment: AppEnvironment.Production,
  });

  describe('build', () => {
    it('Should_CreatePipelineStack_When_PipelineConfigProvided', () => {
      const config = createMinimalConfig();
      config.stacks.shared = {
        pipeline: [
          {
            testBuildSpecs: ['test.yml'],
            deployBuildSpecs: ['deploy.yml'],
            manualApproval: false,
          },
        ],
      };

      const builder = new SharedBuilder(createBuilderProps(config));

      const actual = builder.build(createBuildContext());

      expect(actual).toHaveLength(1);
    });

    it('Should_ReturnEmptyArray_When_NoSharedStacksConfigured', () => {
      const config = createMinimalConfig();
      const builder = new SharedBuilder(createBuilderProps(config));

      const actual = builder.build(createBuildContext());

      expect(actual).toEqual([]);
    });

    it('Should_ThrowError_When_MissingRequiredConfig', () => {
      const config = createMinimalConfig();
      delete (config.stacks as { shared?: unknown }).shared;

      const action = () => new SharedBuilder(createBuilderProps(config));

      expect(action).toThrow('Shared stack configuration is required');
    });
  });
});
