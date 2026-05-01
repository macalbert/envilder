import { inject, injectable } from 'inversify';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';
import type { PushEnvToSecretsCommand } from './PushEnvToSecretsCommand.js';

@injectable()
export class PushEnvToSecretsCommandHandler {
  constructor(
    @inject(TYPES.ISecretProvider)
    private readonly secretProvider: ISecretProvider,
    @inject(TYPES.IVariableStore)
    private readonly variableStore: IVariableStore,
    @inject(TYPES.ILogger) private readonly logger: ILogger,
  ) {}

  /**
   * Handles the PushEnvToSecretsCommand which imports environment variables
   * from a local file and pushes them to the secret store.
   * Uses a map file to determine the secret path for each environment variable.
   *
   * @param command - The PushEnvToSecretsCommand containing mapPath and envFilePath
   */
  async handle(command: PushEnvToSecretsCommand): Promise<void> {
    try {
      this.logger.info(
        `Starting push operation from '${command.envFilePath}' using map '${command.mapPath}'`,
      );
      const config = await this.loadConfiguration(command);
      const validatedPaths = this.validateAndGroupByPath(config);
      await this.pushParametersToStore(validatedPaths);

      this.logger.info(
        `Successfully pushed environment variables from '${command.envFilePath}' to secret store.`,
      );
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(`Failed to push environment file: ${errorMessage}`);
      throw error;
    }
  }

  private async loadConfiguration(command: PushEnvToSecretsCommand): Promise<{
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
   * Validates and groups environment variables by secret path.
   * Ensures that all variables pointing to the same secret path have the same value.
   * Returns a map of secret path to value.
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

    for (const [envKey, secretPath] of Object.entries(paramMap)) {
      const envValue = envVariables[envKey];

      if (envValue === undefined) {
        this.logger.warn(
          `Warning: Environment variable ${envKey} not found in environment file`,
        );
        continue;
      }

      const existing = pathToValueMap.get(secretPath);
      if (existing) {
        if (existing.value !== envValue) {
          const existingMasked = new EnvironmentVariable(
            existing.sourceKeys[0],
            existing.value,
            true,
          ).maskedValue;
          const newMasked = new EnvironmentVariable(envKey, envValue, true)
            .maskedValue;
          throw new Error(
            `Conflicting values for secret path '${EnvironmentVariable.maskSecretPath(secretPath)}': ` +
              `'${existing.sourceKeys[0]}' has value '${existingMasked}' ` +
              `but '${envKey}' has value '${newMasked}'`,
          );
        }
        existing.sourceKeys.push(envKey);
      } else {
        pathToValueMap.set(secretPath, {
          value: envValue,
          sourceKeys: [envKey],
        });
      }
    }

    const uniquePaths = pathToValueMap.size;
    const totalVariables = Object.keys(paramMap).length;
    this.logger.info(
      `Validated ${totalVariables} environment variables mapping to ${uniquePaths} unique secrets`,
    );

    return pathToValueMap;
  }

  private async pushParametersToStore(
    pathToValueMap: Map<string, { value: string; sourceKeys: string[] }>,
  ): Promise<void> {
    const pathsToProcess = Array.from(pathToValueMap.keys());
    this.logger.info(`Processing ${pathsToProcess.length} unique secrets`);

    // Process secrets in parallel with retry logic for throttling errors
    const parameterProcessingPromises = Array.from(
      pathToValueMap.entries(),
    ).map(([secretPath, { value, sourceKeys }]) => {
      return this.retryWithBackoff(() =>
        this.pushParameter(secretPath, value, sourceKeys),
      );
    });

    await Promise.all(parameterProcessingPromises);
  }

  private async pushParameter(
    secretPath: string,
    value: string,
    sourceKeys: string[],
  ): Promise<void> {
    const envVariable = new EnvironmentVariable(sourceKeys[0], value, true);
    await this.secretProvider.setSecret(secretPath, value);

    const keysDescription =
      sourceKeys.length > 1 ? sourceKeys.join(', ') : sourceKeys[0];

    this.logger.info(
      `Pushed ${keysDescription}=${envVariable.maskedValue} to secret store at path ${EnvironmentVariable.maskSecretPath(secretPath)}`,
    );
  }

  /**
   * Retries an async operation with exponential backoff and jitter.
   * Handles throttling errors from cloud providers.
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

        const isThrottlingError =
          typeof error === 'object' &&
          error !== null &&
          (('name' in error &&
            (error.name === 'TooManyUpdates' ||
              error.name === 'ThrottlingException' ||
              error.name === 'TooManyRequestsException')) ||
            ('statusCode' in error && error.statusCode === 429));

        if (!isThrottlingError || attempt === maxRetries) {
          throw error;
        }

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
      const awsError = error as {
        name?: string;
        message?: string;
        code?: string;
      };
      if (awsError.name) {
        return awsError.message
          ? `${awsError.name}: ${awsError.message}`
          : awsError.name;
      }

      const safeFields: string[] = [];
      if (awsError.code) safeFields.push(`code: ${awsError.code}`);
      if (awsError.message) safeFields.push(`message: ${awsError.message}`);

      if (safeFields.length > 0) {
        return `Object error (${safeFields.join(', ')})`;
      }

      return `Object error: ${Object.keys(error as object).join(', ')}`;
    }

    return `Unknown error: ${String(error)}`;
  }
}
