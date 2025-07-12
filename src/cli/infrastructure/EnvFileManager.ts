import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import type { IEnvFileManager } from '../domain/ports/IEnvFileManager';
import type { ILogger } from '../domain/ports/ILogger';

export class EnvFileManager implements IEnvFileManager {
  private logger: ILogger;
  constructor(logger: ILogger) {
    if (!logger) {
      throw new Error('Logger must be specified');
    }
    this.logger = logger;
  }

  async loadMapFile(mapPath: string): Promise<Record<string, string>> {
    const content = await fs.readFile(mapPath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (_err: unknown) {
      this.logger.error(`Error parsing JSON from ${mapPath}`);
      throw new Error(`Invalid JSON in parameter map file: ${mapPath}`);
    }
  }

  async loadEnvFile(envFilePath: string): Promise<Record<string, string>> {
    const envVariables: Record<string, string> = {};
    try {
      await fs.access(envFilePath);
    } catch {
      return envVariables;
    }
    const existingEnvContent = await fs.readFile(envFilePath, 'utf-8');
    const parsedEnv = dotenv.parse(existingEnvContent) || {};
    Object.assign(envVariables, parsedEnv);

    return envVariables;
  }

  async saveEnvFile(
    envFilePath: string,
    envVariables: Record<string, string>,
  ): Promise<void> {
    const envContent = Object.entries(envVariables)
      .map(([key, value]) => `${key}=${this.escapeEnvValue(value)}`)
      .join('\n');

    try {
      await fs.writeFile(envFilePath, envContent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to write environment file: ${errorMessage}`);
      throw error;
    }
  }

  private escapeEnvValue(value: string): string {
    return value.replace(/(\r\n|\n|\r)/g, '\\n');
  }
}
