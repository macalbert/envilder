import type { FrontendStackConfig } from '../../config/domain/model/stackConfig';

export const frontendConfig: FrontendStackConfig = {
  staticWebsites: [
    {
      name: 'Website',
      subdomain: 'envilder',
      projectPath: 'envilder/src/apps/website/dist',
    },
  ],
};
