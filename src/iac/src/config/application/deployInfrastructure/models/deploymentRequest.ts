import type { AppEnvironment } from '../../../domain/model/appEnvironment';
import type {
  FrontendStackConfig,
  SharedStackConfig,
} from '../../../domain/model/stackConfig';

/**
 * IAC Domain configuration interface
 */
export interface IacDomainConfig {
  /** Base domain name */
  name: string;
  /** ACM Certificate ID (without full ARN) */
  certificateId: string;
  /** Route53 Hosted Zone ID */
  hostedZoneId: string;
}

/**
 * Stacks configuration interface
 */
export interface StacksConfig {
  frontend: FrontendStackConfig;
  shared: SharedStackConfig;
}

/**
 * Main Deployment configuration interface
 */
export interface IDeploymentRequest {
  /** GitHub repository name */
  repoName: string;

  /** AWS VPC ID for deployment */
  vpcId: string;

  /** Git branch for deployment */
  branch: string;

  /** Application environment */
  environment: AppEnvironment;

  /** Domain configuration */
  domain: IacDomainConfig;

  /** Stacks configuration */
  stacks: StacksConfig;

  /**
   * GitHub secret ARN for pipeline authentication
   * @optional If not provided, a default pattern will be used
   */
  githubSecretArn?: string;

  /**
   * Root path for project resolution
   * @optional Defaults to process.cwd()/../../../ if not specified
   */
  rootPath?: string;
}
