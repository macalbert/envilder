import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import {
  DependencyMissingError,
  EnvironmentFileError,
} from '../../domain/errors/DomainErrors.js';
import type { IVariableStore } from '../../domain/ports/IEnvFileManager.js';
import type { ILogger } from '../../domain/ports/ILogger.js';

export class FileVariableStore implements IVariableStore {
  private logger: ILogger;
  constructor(logger: ILogger) {
    if (!logger) {
      throw new DependencyMissingError('Logger must be specified');
    }
    this.logger = logger;
  }

  async getMapping(source: string): Promise<Record<string, string>> {
    try {
      const content = await fs.readFile(source, 'utf-8');
      try {
        return JSON.parse(content);
      } catch (_err: unknown) {
        this.logger.error(`Error parsing JSON from ${source}`);
        throw new EnvironmentFileError(
          `Invalid JSON in parameter map file: ${source}`,
        );
      }
    } catch (error) {
      if (error instanceof EnvironmentFileError) {
        throw error;
      }
      throw new EnvironmentFileError(`Failed to read map file: ${source}`);
    }
  }

  async getEnvironment(source: string): Promise<Record<string, string>> {
    const envVariables: Record<string, string> = {};
    try {
      await fs.access(source);
    } catch {
      return envVariables;
    }
    const existingEnvContent = await fs.readFile(source, 'utf-8');
    const parsedEnv = dotenv.parse(existingEnvContent) || {};
    Object.assign(envVariables, parsedEnv);

    return envVariables;
  }

  async saveEnvironment(
    destination: string,
    envVariables: Record<string, string>,
  ): Promise<void> {
    const envContent = Object.entries(envVariables)
      .map(([key, value]) => `${key}=${this.escapeEnvValue(value)}`)
      .join('\n');

    try {
      await fs.writeFile(destination, envContent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to write environment file: ${errorMessage}`);
      throw new EnvironmentFileError(
        `Failed to write environment file: ${errorMessage}`,
      );
    }
  }

  private escapeEnvValue(value: string): string {
    return value.replace(/(\r\n|\n|\r)/g, '\\n');
  }
}
