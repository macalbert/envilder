import { Stack, type StackProps, Tags } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { formatRepoNameForCloudFormation } from '../infrastructure/utilities/cloudFormationUtils';
import type { AppEnvironment } from './model/appEnvironment';

/**
 * Configuration for a domain that the stack should serve.
 * Used for multi-domain support in website stacks.
 */
export interface DomainConfig {
  /** Optional subdomain prefix (e.g., "www", "api", "dashboard") */
  subdomain?: string;
  /** Root domain name (e.g., "example.com") */
  domainName: string;
  /** Route 53 hosted zone ID for this domain */
  hostedZoneId: string;
  /** ACM certificate ID (without the ARN prefix) */
  certificateId: string;
}

export interface CustomStackProps extends StackProps {
  githubRepo: string;
  envName: AppEnvironment;
  name: string;
  stackName: string;
}

export class CustomStack extends Stack {
  props: CustomStackProps;

  constructor(scope: Construct, props: CustomStackProps) {
    super(scope, getStackName(props), props);

    this.props = props;

    this.addProjectTags();
  }

  getStackId(): string {
    return getStackName(this.props);
  }

  private addProjectTags(): void {
    Tags.of(this).add('StackId', getStackName(this.props), {
      priority: 300,
    });

    Tags.of(this).add('Environment', this.props.envName.valueOf(), {
      priority: 300,
    });

    Tags.of(this).add('Project', this.props.githubRepo, {
      priority: 300,
    });
  }

  public toCloudFormation(): string {
    return formatRepoNameForCloudFormation(this.props.githubRepo);
  }
}

function getStackName(props: CustomStackProps): string {
  return `macalbert-${formatRepoNameForCloudFormation(props.githubRepo)}-${props.name}-${props.envName}-stack`.toLowerCase();
}
