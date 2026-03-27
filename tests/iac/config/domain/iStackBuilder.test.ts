import {
  IStackBuilder,
  type IStackBuildProps,
  type IStackBuildContext,
} from '../../../../src/iac/config/domain/iStackBuilder';
import type { IDeploymentRequest } from '../../../../src/iac/config/application/deployInfrastructure/models/deploymentRequest';
import { AppEnvironment } from '../../../../src/iac/config/domain/model/appEnvironment';
import type { Stack } from 'aws-cdk-lib';
import { App } from 'aws-cdk-lib';

class ConcreteStackBuilder extends IStackBuilder {
  public context!: IStackBuildContext;

  getIacConfig(): IDeploymentRequest {
    return this.props.iacConfig;
  }

  formatRepoNameForCloudFormation(): string {
    return this.props.iacConfig.repoName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
  }

  build(context: IStackBuildContext): Stack[] {
    this.context = context;
    return [];
  }
}

describe('IStackBuilder', () => {
  const createMockConfig = (): IDeploymentRequest => ({
    repoName: 'test-repo',
    branch: 'main',
    environment: AppEnvironment.Production,
    domain: {
      name: 'example.com',
      certificateId: 'cert-123',
      hostedZoneId: 'zone-123',
    },
    stacks: {
      frontend: { staticWebsites: [] },
    },
  });

  const createProps = (config: IDeploymentRequest): IStackBuildProps => ({
    scope: new App(),
    iacConfig: config,
    stackName: 'test-stack',
  });

  describe('getIacConfig', () => {
    it('Should_ReturnConfiguration_When_Called', () => {
      const config = createMockConfig();
      const stackPart = new ConcreteStackBuilder(createProps(config));

      const actual = stackPart.getIacConfig();

      expect(actual).toBe(config);
    });
  });

  describe('formatRepoNameForCloudFormation', () => {
    it('Should_FormatRepoName_When_SpecialCharactersPresent', () => {
      const config = createMockConfig();
      config.repoName = 'test-repo_name.with-special';
      const stackPart = new ConcreteStackBuilder(createProps(config));

      const actual = stackPart.formatRepoNameForCloudFormation();

      expect(actual).toBe('test-repo-name-with-special');
    });
  });

  describe('build', () => {
    it('Should_BuildSuccessfully_When_ContextProvided', () => {
      const config = createMockConfig();
      const stackPart = new ConcreteStackBuilder(createProps(config));
      const context: IStackBuildContext = {
        env: { account: '123456789012', region: 'us-east-1' },
        environment: AppEnvironment.Production,
      };

      const actual = stackPart.build(context);

      expect(actual).toEqual([]);
    });
  });
});
