import type { Stack } from 'aws-cdk-lib';
import type { StaticWebsiteStackProps } from '../../../aws/website/staticWebsiteStack';
import { StaticWebsiteStack } from '../../../aws/website/staticWebsiteStack';
import type { IacDomainConfig } from '../../application/deployInfrastructure/models/deploymentRequest';
import type { IStackBuildContext, IStackBuildProps } from '../iStackBuilder';
import { IStackBuilder } from '../iStackBuilder';
import type { FrontendStackConfig } from '../model/stackConfig';
import type { IProjectPath } from '../ports/iProjectPath';

export interface FrontendBuilderProps extends IStackBuildProps {
  projectPathResolver: IProjectPath;
}

export class FrontendBuilder extends IStackBuilder {
  private readonly frontendConfig: FrontendStackConfig;
  private readonly domain: IacDomainConfig;
  private readonly projectPathResolver: IProjectPath;

  constructor(frontendProps: FrontendBuilderProps) {
    super(frontendProps);
    if (!frontendProps.iacConfig.stacks.frontend) {
      throw new Error('Frontend stack configuration is required');
    }
    this.frontendConfig = frontendProps.iacConfig.stacks.frontend;
    this.domain = frontendProps.iacConfig.domain;
    this.projectPathResolver = frontendProps.projectPathResolver;
  }

  build(context: IStackBuildContext): Stack[] {
    this.context = context;
    const stacks: Stack[] = [];

    for (const websiteConfig of this.frontendConfig.staticWebsites) {
      const staticWebsiteStack = this.createStaticWebsiteStack(websiteConfig);
      stacks.push(staticWebsiteStack);
    }

    return stacks;
  }

  private createStaticWebsiteStack(
    config: FrontendStackConfig['staticWebsites'][number],
  ): StaticWebsiteStack {
    const domainConfig = {
      subdomain: config.subdomain,
      domainName: this.domain.name,
      certificateId: this.domain.certificateId,
      hostedZoneId: this.domain.hostedZoneId,
    };

    const distFolderPath = this.projectPathResolver.resolveFullPath(
      config.projectPath,
    );

    const frontendStackProps: StaticWebsiteStackProps = {
      env: this.context.env,
      name: config.name,
      domains: [domainConfig],
      distFolderPath,
      envName: this.context.environment,
      githubRepo: this.props.iacConfig.repoName,
      stackName: `${this.props.iacConfig.repoName}-${config.name}`,
    };

    return new StaticWebsiteStack(this.props.scope, frontendStackProps);
  }
}
