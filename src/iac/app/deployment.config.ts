import { AppEnvironment } from '../domain/model/appEnvironment';
import type { IDeploymentConfig } from '../domain/model/deploymentConfig';

export const deploymentConfig: IDeploymentConfig = {
  repoName: 'envilder',
  branch: 'main',
  environment: AppEnvironment.Production,
  domain: {
    name: 'envilder.com',
    certificateId: 'e04983fe-1561-4ebe-9166-83f77789964a',
        hostedZoneId: 'Z0718467FEEOZ35UNCTO',
  },
  stacks: {
    frontend: {
      staticWebsites: [
        {
          name: 'Website',
          projectPath: 'envilder/src/apps/website/dist',
        },
      ],
    },
  },
};
