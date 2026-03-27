import type { Environment, Stack } from 'aws-cdk-lib';
import type { Node } from 'constructs';
import type { AppEnvironment } from '../../domain/model/appEnvironment';
import type { ILogger } from '../../domain/ports/iLogger';
import { StackBuildError } from '../../infrastructure/utilities/errors';
import type { IStackBuilder } from '../iStackBuilder';

/**
 * Service responsible for building stacks from stack parts
 */
export class StackBuilderService {
  constructor(
    private readonly logger: ILogger,
    private readonly githubRepo: string,
    private readonly env: Environment,
    private readonly node: Node,
    private readonly environment: AppEnvironment,
  ) {}

  /**
   * Get branch name from CDK context or default to main
   */
  getBranchName(): string {
    const branchName = this.node.tryGetContext('branch') ?? 'main';
    this.logger.logRepositoryInfo(this.githubRepo, branchName);
    return branchName;
  }

  /**
   * Build all stack parts
   * @param stackParts Array of stack builders to build
   * @returns Array of all created stacks
   */
  buildStackParts(stackParts: IStackBuilder[]): Stack[] {
    this.logger.logRequestedStacks();

    const context = {
      env: this.env,
      environment: this.environment,
    };

    const allStacks: Stack[] = [];

    for (const stack of stackParts) {
      try {
        const stacks = stack.build(context);
        allStacks.push(...stacks);
      } catch (error: unknown) {
        // Check if this is a "Cannot find asset" error which can be safely ignored
        if (typeof error === 'object' && error !== null) {
          const errorMessage = error.toString();
          if (errorMessage.includes('Error: Cannot find asset')) {
            // Log ignored error for visibility
            console.warn(
              `⚠️  Ignoring "Cannot find asset" error in ${this.getStackName(stack)}: ${errorMessage}`,
            );
          } else {
            throw new StackBuildError(
              `Failed to build stack part: ${this.getStackName(stack)}`,
              this.getStackName(stack),
              error instanceof Error ? error : undefined,
            );
          }
        } else {
          throw error;
        }
      }
    }

    return allStacks;
  }

  /**
   * Get stack name from stack part for error reporting
   */
  private getStackName(stack: IStackBuilder): string {
    return stack.constructor.name;
  }
}
