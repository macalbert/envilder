import type { SharedStackConfig } from '../../config/domain/model/stackConfig';

export const sharedConfig: SharedStackConfig = {
  pipeline: [
    {
      manualApproval: false,
      testBuildSpecs: [
        'envilder/src/iac/src/infra/buildspecs/test/iac.yml',
        'envilder/src/iac/src/infra/buildspecs/test/website.yml',
      ],
      deployBuildSpecs: [
        'envilder/src/iac/src/infra/buildspecs/production/website.yml',
      ],
    },
  ],
};
