import { RemovalPolicy, type Stack } from 'aws-cdk-lib';
import type { PipelineStackProps } from '../../../aws/developerTools/codepipeline/pipelineStack';
import { PipelineStack } from '../../../aws/developerTools/codepipeline/pipelineStack';
import type { IacDomainConfig } from '../../application/deployInfrastructure/models/deploymentRequest';
import type { IStackBuildContext, IStackBuildProps } from '../iStackBuilder';
import { IStackBuilder } from '../iStackBuilder';
import type { SharedStackConfig } from '../model/stackConfig';

export type SharedBuilderProps = IStackBuildProps;

export class SharedBuilder extends IStackBuilder {
  private readonly sharedConfig: SharedStackConfig;
  private readonly domain: IacDomainConfig;
  private readonly repoName: string;

  constructor(sharedProps: SharedBuilderProps) {
    super(sharedProps);
    if (!sharedProps.iacConfig.stacks.shared) {
      throw new Error('Shared stack configuration is required');
    }
    this.sharedConfig = sharedProps.iacConfig.stacks.shared;
    this.domain = sharedProps.iacConfig.domain;
    this.repoName = sharedProps.iacConfig.repoName;
  }

  build(context: IStackBuildContext): Stack[] {
    this.context = context;
    const stacks: Stack[] = [];

    if (this.sharedConfig.pipeline) {
      for (const pipelineConfig of this.sharedConfig.pipeline) {
        stacks.push(this.createPipelineStack(pipelineConfig));
      }
    }

    return stacks;
  }

  private createPipelineStack(
    config: NonNullable<SharedStackConfig['pipeline']>[number],
  ): PipelineStack {
    const pipeline: PipelineStackProps = {
      name: 'Pipeline',
      branch: this.props.iacConfig.branch,
      githubRepo: this.repoName,
      envName: this.context.environment,
      secretTokenArn:
        this.props.iacConfig.githubSecretArn ??
        `arn:aws:secretsmanager:${this.context.env.region}:${this.context.env.account}:secret:github-access-token-secret-maOkMI`,
      testBuildSpec: [...config.testBuildSpecs],
      deployBuildSpec: [...config.deployBuildSpecs],
      testProjectName: `${this.repoName}-Tests`,
      vpc: this.context.vpc,
      env: this.context.env,
      bucketRemovalPolicy: RemovalPolicy.DESTROY,
      domain: this.domain.name,
      stackName: `${this.repoName}-CodePipeline`,
      manualApproval: config.manualApproval,
      slackChannelConfigurationName: config.slackChannelConfigurationName,
      cacheConfig: { type: 's3' },
    };

    return new PipelineStack(this.props.scope, pipeline);
  }
}
