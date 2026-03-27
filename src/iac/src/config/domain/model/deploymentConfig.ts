import type { AppEnvironment } from './appEnvironment';
import type { FrontendStackConfig } from './stackConfig';

/**
 * Main deployment configuration interface for IAC projects
 */
export interface IDeploymentConfig {
  repoName: string;
  branch: string;
  vpcId: string;
  environment: AppEnvironment;
  domain: {
    name: string;
    certificateId: string;
    hostedZoneId: string;
  };
  stacks: {
    frontend: FrontendStackConfig;
  };
}
