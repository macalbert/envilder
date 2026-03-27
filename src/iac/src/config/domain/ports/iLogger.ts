import type { IDeploymentRequest } from '../../application/deployInfrastructure/models/deploymentRequest';
import type { IProjectPath } from './iProjectPath';

/**
 * Interface for logging deployment information
 */
export interface ILogger {
  /**
   * Display deployment information
   * @param config Deployment configuration
   * @param pathResolver Project path resolver
   * @param region AWS region
   * @param account AWS account ID
   */
  displayDeploymentInfo(
    config: IDeploymentRequest,
    pathResolver: IProjectPath,
    region?: string,
    account?: string,
  ): void;

  /**
   * Log that requested stacks are being built
   */
  logRequestedStacks(): void;

  /**
   * Log repository information
   * @param repoName Repository name
   * @param branchName Branch name
   */
  logRepositoryInfo(repoName: string, branchName: string): void;

  /**
   * Log an informational message
   * @param message Message to log
   */
  logInfo(message: string): void;

  /**
   * Log an error
   * @param error Error to log
   */
  logError(error: Error): void;
}
