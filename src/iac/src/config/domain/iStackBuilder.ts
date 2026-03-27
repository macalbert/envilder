import type { Environment, Stack } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import type { Construct } from 'constructs';
import type { IDeploymentRequest } from '../application/deployInfrastructure/models/deploymentRequest';
import { formatRepoNameForCloudFormation } from '../infrastructure/utilities/cloudFormationUtils';
import type { AppEnvironment } from './model/appEnvironment';

export interface IStackBuildProps {
  stackName: string;
  scope: Construct;
  iacConfig: IDeploymentRequest;
}

export interface IStackBuildContext {
  env: Environment;
  vpc: IVpc;
  environment: AppEnvironment;
}

export abstract class IStackBuilder {
  protected props: IStackBuildProps;
  protected context: IStackBuildContext;

  constructor(props: IStackBuildProps) {
    this.props = props;
  }

  abstract build(context: IStackBuildContext): Stack[];

  /**
   * Get the IAC configuration
   */
  public getIacConfig(): IDeploymentRequest {
    return this.props.iacConfig;
  }

  /**
   * Returns a formatted repository name that complies with AWS CloudFormation stack naming requirements.
   */
  public formatRepoNameForCloudFormation(): string {
    return formatRepoNameForCloudFormation(this.props.iacConfig.repoName);
  }
}
