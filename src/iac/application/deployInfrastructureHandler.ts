import type { App, Environment, Stack } from 'aws-cdk-lib';
import type { IDeploymentConfig } from '../domain/model/deploymentConfig';
import type { ILogger } from '../domain/ports/iLogger';
import type { IProjectPath } from '../domain/ports/iProjectPath';
import { ConfigValidator } from '../domain/validation/configValidator';
import {
  StaticWebsiteStack,
  type StaticWebsiteStackProps,
} from '../infrastructure/stacks/staticWebsiteStack';

export class DeployInfrastructureHandler {
  private readonly app: App;
  private readonly envFromCli: Environment;
  private readonly config: IDeploymentConfig;
  private readonly projectPathResolver: IProjectPath;
  private readonly logger: ILogger;
  private readonly validator: ConfigValidator;

  constructor(
    app: App,
    envFromCli: Environment,
    config: IDeploymentConfig,
    logger: ILogger,
    projectPath: IProjectPath,
  ) {
    this.app = app;
    this.envFromCli = envFromCli;
    this.config = config;
    this.logger = logger;
    this.validator = new ConfigValidator();
    this.projectPathResolver = projectPath;
  }

  public run(): Stack[] {
    try {
      this.validator.validate(this.config);
      this.logDeploymentInfo();
      return this.buildStacks();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error);
      }
      throw error;
    }
  }

  private logDeploymentInfo(): void {
    const entries: Array<{ label: string; value: string }> = [
      { label: 'Repository', value: this.config.repoName },
      { label: 'Branch', value: this.config.branch },
      { label: 'Environment', value: String(this.config.environment) },
    ];

    if (this.envFromCli.region) {
      entries.push({ label: 'Region', value: this.envFromCli.region });
    }
    if (this.envFromCli.account) {
      entries.push({
        label: 'Account',
        value: `***${this.envFromCli.account.slice(-4)}`,
      });
    }

    entries.push({
      label: 'Root Path',
      value: this.projectPathResolver.getRootPath(),
    });

    for (const ws of this.config.stacks.frontend.staticWebsites) {
      entries.push({
        label: ws.name,
        value: this.projectPathResolver.resolveFullPath(ws.projectPath),
      });
    }

    this.logger.table(entries);
  }

  private buildStacks(): Stack[] {
    this.logger.info('🎯 Requested stacks:');

    const stacks: Stack[] = [];

    for (const websiteConfig of this.config.stacks.frontend.staticWebsites) {
      const domainConfig = {
        subdomain: websiteConfig.subdomain,
        domainName: this.config.domain.name,
        certificateId: this.config.domain.certificateId,
        hostedZoneId: this.config.domain.hostedZoneId,
      };

      const distFolderPath = this.projectPathResolver.resolveFullPath(
        websiteConfig.projectPath,
      );

      const props: StaticWebsiteStackProps = {
        env: this.envFromCli,
        name: websiteConfig.name,
        domains: [domainConfig],
        distFolderPath,
        envName: this.config.environment,
        githubRepo: this.config.repoName,
        stackName: `${this.config.repoName}-${websiteConfig.name}`,
      };

      stacks.push(new StaticWebsiteStack(this.app, props));
    }

    return stacks;
  }
}
