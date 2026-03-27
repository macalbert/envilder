import type { IDeploymentConfig } from '../config/domain/model/deploymentConfig';
import { AppEnvironment } from '../config/domain/model/appEnvironment';
import { frontendConfig } from './config/frontendConfig';

export const iacConfig: IDeploymentConfig = {
  repoName: 'envilder',
  branch: 'main',
  vpcId: 'vpc-ee04cd97',
  environment: AppEnvironment.Production,
  domain: {
    name: 'envilder.io',
    certificateId: 'be63062d-5316-47af-9f94-819c1dc02853',
    hostedZoneId: 'Z0832486XTB67JEGNLMB',
  },
  stacks: {
    frontend: frontendConfig,
  },
};
