import type { IDeploymentRequest } from '../../application/deployInfrastructure/models/deploymentRequest';
import type { ModulePathConfig } from '../../domain/model/stackConfig';
import type { ILogger } from '../../domain/ports/iLogger';
import type { IProjectPath } from '../../domain/ports/iProjectPath';

/**
 * Service responsible for logging and displaying deployment information.
 */
export class ConsoleDeploymentLogger implements ILogger {
  private log(message: string): void {
    console.log(message);
  }

  private logColored(color: string, message: string): void {
    console.log(`${color}${message}\x1b[0m`);
  }

  /**
   * Display deployment information
   * @param config IAC configuration
   * @param pathResolver Project path resolver
   * @param region AWS region
   * @param account AWS account ID
   */
  displayDeploymentInfo(
    config: IDeploymentRequest,
    pathResolver: IProjectPath,
    region?: string,
    account?: string,
  ): void {
    this.log(
      `\n------[${config.repoName}]----------------------------------------------------------------`,
    );
    this.logColored('\x1b[36m', '🔑 Credentials loaded from AWS CLI');

    if (region) {
      this.log(`Region: ${region}`);
    }

    if (account) {
      this.log(`Account: ***${account.slice(-4)}`);
    }

    this.log('');

    this.logModulePathsTable(config, pathResolver);
  }

  /**
   * Log module paths in a formatted table
   * @param config IAC configuration
   * @param pathResolver Project path resolver
   */
  private logModulePathsTable(
    config: IDeploymentRequest,
    pathResolver: IProjectPath,
  ): void {
    const pathEntries: Array<{ label: string; value: string }> = [
      {
        label: 'Repository Root',
        value: pathResolver.getRootPath(),
      },
    ];

    const modules: ReadonlyArray<ModulePathConfig> = [
      ...config.stacks.frontend.staticWebsites,
    ];

    for (const moduleConfig of modules) {
      pathEntries.push({
        label: moduleConfig.name,
        value: pathResolver.resolveFullPath(moduleConfig.projectPath),
      });
    }

    // Calculate column widths
    const maxLabelLength = Math.max(
      ...pathEntries.map((entry) => entry.label.length),
    );

    const maxValueLength = Math.max(
      ...pathEntries.map((entry) => entry.value.length),
    );

    // Build table
    const tableWidth = maxLabelLength + maxValueLength + 6;
    const headerTitle = ' 📁 Module Paths Configuration ';
    const headerPadding = Math.max(0, tableWidth - headerTitle.length - 2);

    this.log(`\n╭─${headerTitle}${'─'.repeat(headerPadding)}╮`);

    for (const { label, value } of pathEntries) {
      const paddedLabel = label.padEnd(maxLabelLength);
      const paddedValue = value.padEnd(maxValueLength);
      this.log(`│ ${paddedLabel} │ ${paddedValue} │`);
    }

    this.log(
      `╰${'─'.repeat(maxLabelLength + 2)}┴${'─'.repeat(maxValueLength + 2)}╯\n`,
    );
  }

  /**
   * Log requested stacks
   */
  logRequestedStacks(): void {
    this.logColored('\x1b[36m', '🎯 Requested stacks:');
  }

  /**
   * Log repository information
   * @param repoName Repository name
   * @param branchName Branch name
   */
  logRepositoryInfo(repoName: string, branchName: string): void {
    this.logColored(
      '\x1b[33m',
      `🔌 Repository source https://github.com/macalbert/${repoName}/tree/${branchName}`,
    );
  }

  /**
   * Log an informational message
   * @param message Message to log
   */
  logInfo(message: string): void {
    this.log(message);
  }

  /**
   * Log error message
   * @param error Error to log
   */
  logError(error: Error): void {
    console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}
