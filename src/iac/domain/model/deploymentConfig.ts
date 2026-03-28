import type { AppEnvironment } from './appEnvironment';
import type { FrontendStackConfig } from './stackConfig';

export interface DomainConfig {
  name: string;
  certificateId: string;
  hostedZoneId: string;
}

export interface StacksConfig {
  frontend: FrontendStackConfig;
}

export interface IDeploymentConfig {
  repoName: string;
  branch: string;
  environment: AppEnvironment;
  domain: DomainConfig;
  stacks: StacksConfig;
  rootPath?: string;
}
