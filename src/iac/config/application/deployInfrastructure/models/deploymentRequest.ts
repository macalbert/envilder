import type { AppEnvironment } from '../../../domain/model/appEnvironment';
import type { FrontendStackConfig } from '../../../domain/model/stackConfig';

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
}

/**
 * Main Deployment configuration interface
 */
export interface IDeploymentRequest {
  /** GitHub repository name */
  repoName: string;

  /** Git branch for deployment */
  branch: string;

  /** Application environment */
  environment: AppEnvironment;

  /** Domain configuration */
  domain: IacDomainConfig;

  /** Stacks configuration */
  stacks: StacksConfig;

  /**
   * Root path for project resolution
   * @optional Defaults to process.cwd()/../../../ if not specified
   */
  rootPath?: string;
}
