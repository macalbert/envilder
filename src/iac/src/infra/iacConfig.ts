import type { IDeploymentConfig } from '../config/domain/model/deploymentConfig';
import { AppEnvironment } from '../config/domain/model/appEnvironment';
import { frontendConfig } from './config/frontendConfig';

export const iacConfig: IDeploymentConfig = {
  repoName: 'envilder',
  branch: 'main',
  vpcId: 'vpc-ee04cd97',
  environment: AppEnvironment.Production,
  domain: {
    name: 'envilder.com',
    certificateId: 'e04983fe-1561-4ebe-9166-83f77789964a',
    hostedZoneId: 'Z0718467FEEOZ35UNCTO',
  },
  stacks: {
    frontend: frontendConfig,
  },
};
