import type { App, Environment, Stack } from 'aws-cdk-lib';
import { VpcLookupStack } from '../../../aws/network/vpcLookupStack';
import { StackBuilderFactory } from '../../domain/builders/factories/stackBuilderFactory';
import type { ILogger } from '../../domain/ports/iLogger';
import type { IProjectPath } from '../../domain/ports/iProjectPath';
import { StackBuilderService } from '../../domain/services/stackBuilderService';
import { ConfigValidator } from '../../domain/validation/configValidator';
import { ConsoleDeploymentLogger } from '../../infrastructure/logging/consoleDeploymentLogger';
import { FileProjectPath } from '../../infrastructure/projectPath/fileProjectPath';
import type { IDeploymentRequest } from './models/deploymentRequest';

/**
 * Use case: Deploy Infrastructure
 * Orchestrates the CDK deployment process
 */
export class DeployInfrastructureHandler {
  private readonly app: App;
  private readonly envFromCli: Environment;
  private readonly request: IDeploymentRequest;
  private readonly projectPathResolver: IProjectPath;
  private readonly logger: ILogger;
  private readonly validator: ConfigValidator;

  constructor(app: App, envFromCli: Environment, request: IDeploymentRequest) {
    this.app = app;
    this.envFromCli = envFromCli;
    this.request = request;

    this.logger = new ConsoleDeploymentLogger();
    this.validator = new ConfigValidator();

    this.projectPathResolver = new FileProjectPath(this.request.rootPath);
  }

  public getProjectPathResolver(): IProjectPath {
    return this.projectPathResolver;
  }

  public run(): Stack[] {
    try {
      this.validator.validate(this.request);
      this.logger.displayDeploymentInfo(
        this.request,
        this.projectPathResolver,
        this.envFromCli.region,
        this.envFromCli.account,
      );
      const stacks = this.buildStacks();
      return stacks;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.logError(error);
      }
      throw error;
    }
  }

  private buildStacks(): Stack[] {
    const vpcStack = new VpcLookupStack(this.app, {
      env: this.envFromCli,
      vpcId: this.request.vpcId,
    });

    const stackBuilder = new StackBuilderService(
      this.logger,
      this.request.repoName,
      this.envFromCli,
      vpcStack.vpc,
      this.app.node,
      this.request.environment,
    );

    stackBuilder.getBranchName();

    const stackParts = StackBuilderFactory.createStackParts(
      this.app,
      this.request,
    );

    return stackBuilder.buildStackParts(stackParts);
  }
}
