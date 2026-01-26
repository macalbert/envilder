import { inject, injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import type { PushEnvToSsmCommand } from './PushEnvToSsmCommand.js';

@injectable()
export class PushEnvToSsmCommandHandler {
  constructor(
    @inject(TYPES.ISecretProvider)
    private readonly secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
  ) {}

  /**
   * Handles the PushEnvToSsmCommand which imports environment variables
   * from a local file and pushes them to AWS SSM.
   * Uses a map file to determine the SSM parameter path for each environment variable.
   *
   * @param command - The PushEnvToSsmCommand containing mapPath and envFilePath
   */
  async handle(command: PushEnvToSsmCommand): Promise<void> {
    try {
      this.logger.info(
        `Starting push operation from '${command.envFilePath}' using map '${command.mapPath}'`,
      );
      const config = await this.loadConfiguration(command);
      const validatedPaths = this.validateAndGroupByPath(config);
      await this.pushParametersToSSM(validatedPaths);

      this.logger.info(
        `Successfully pushed environment variables from '${command.envFilePath}' to AWS SSM.`,
      );
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(`Failed to push environment file: ${errorMessage}`);
      throw error;
    }
  }

  private async loadConfiguration(command: PushEnvToSsmCommand): Promise<{
    paramMap: Record<string, string>;
    envVariables: Record<string, string>;
  }> {
    this.logger.info(`Loading parameter map from '${command.mapPath}'`);
    const paramMap = await this.variableStore.getMapping(command.mapPath);

    this.logger.info(
      `Loading environment variables from '${command.envFilePath}'`,
    );
    const envVariables = await this.variableStore.getEnvironment(
      command.envFilePath,
    );

    this.logger.info(
      `Found ${Object.keys(paramMap).length} parameter mappings in map file`,
    );
    this.logger.info(
      `Found ${Object.keys(envVariables).length} environment variables in env file`,
    );

    return { paramMap, envVariables };
  }

  /**
   * Validates and groups environment variables by SSM path.
   * Ensures that all variables pointing to the same SSM path have the same value.
   * Returns a map of SSM path to value.
   */
  private validateAndGroupByPath(config: {
    paramMap: Record<string, string>;
    envVariables: Record<string, string>;
  }): Map<string, { value: string; sourceKeys: string[] }> {
    const { paramMap, envVariables } = config;
    const pathToValueMap = new Map<
      string,
      { value: string; sourceKeys: string[] }
    >();

    for (const [envKey, ssmPath] of Object.entries(paramMap)) {
      const envValue = envVariables[envKey];

      if (envValue === undefined) {
        continue; // Skip missing variables (already handled by processVariable)
      }

      const existing = pathToValueMap.get(ssmPath);
      if (existing) {
        // Multiple variables point to the same SSM path - validate they have the same value
        if (existing.value !== envValue) {
          throw new Error(
            `Conflicting values for SSM path '${ssmPath}': ` +
              `'${existing.sourceKeys[0]}' has value '${existing.value}' ` +
              `but '${envKey}' has value '${envValue}'`,
          );
        }
        existing.sourceKeys.push(envKey);
      } else {
        pathToValueMap.set(ssmPath, { value: envValue, sourceKeys: [envKey] });
      }
    }

    const uniquePaths = pathToValueMap.size;
    const totalVariables = Object.keys(paramMap).length;
    this.logger.info(
      `Validated ${totalVariables} environment variables mapping to ${uniquePaths} unique SSM parameters`,
    );

    return pathToValueMap;
  }

  private async pushParametersToSSM(
    pathToValueMap: Map<string, { value: string; sourceKeys: string[] }>,
  ): Promise<void> {
    const pathsToProcess = Array.from(pathToValueMap.keys());
    this.logger.info(
      `Processing ${pathsToProcess.length} unique SSM parameters`,
    );

    // Process parameters in parallel with retry logic for throttling errors
    const parameterProcessingPromises = Array.from(
      pathToValueMap.entries(),
    ).map(([ssmPath, { value, sourceKeys }]) => {
      return this.retryWithBackoff(() =>
        this.pushParameter(ssmPath, value, sourceKeys),
      );
    });

    await Promise.all(parameterProcessingPromises);
  }

  private async pushParameter(
    ssmPath: string,
    value: string,
    sourceKeys: string[],
  ): Promise<void> {
    const envVariable = new EnvironmentVariable(sourceKeys[0], value, true);
    await this.secretProvider.setSecret(ssmPath, value);

    const keysDescription =
      sourceKeys.length > 1 ? `${sourceKeys.join(', ')}` : sourceKeys[0];

    this.logger.info(
      `Pushed ${keysDescription}=${envVariable.maskedValue} to AWS SSM at path ${ssmPath}`,
    );
  }

  /**
   * Retries an async operation with exponential backoff and jitter.
   * Handles AWS SSM throttling errors (TooManyUpdates).
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 5,
    baseDelayMs = 100,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Check if it's a throttling error
        const isThrottlingError =
          typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          (error.name === 'TooManyUpdates' ||
            error.name === 'ThrottlingException' ||
            error.name === 'TooManyRequestsException');

        // If it's not a throttling error or we've exhausted retries, throw immediately
        if (!isThrottlingError || attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff + jitter
        const exponentialDelay = baseDelayMs * 2 ** attempt;
        const jitter = Math.random() * exponentialDelay * 0.5; // 0-50% jitter
        const delayMs = exponentialDelay + jitter;

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error === null) {
      return 'Unknown error (null)';
    }

    if (error === undefined) {
      return 'Unknown error (undefined)';
    }

    if (typeof error === 'object') {
      // AWS SDK errors have a 'name' property
      const awsError = error as { name?: string; message?: string };
      if (awsError.name) {
        return awsError.message
          ? `${awsError.name}: ${awsError.message}`
          : awsError.name;
      }

      try {
        return JSON.stringify(error);
      } catch {
        return `Unknown error (${typeof error})`;
      }
    }

    return `Unknown error: ${String(error)}`;
  }
}
