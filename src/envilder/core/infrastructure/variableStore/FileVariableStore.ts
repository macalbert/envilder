import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import { inject, injectable } from 'inversify';
import {
  DependencyMissingError,
  EnvironmentFileError,
} from '../../domain/errors/DomainErrors.js';
import type {
  MapFileConfig,
  ParsedMapFile,
} from '../../domain/MapFileConfig.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { IVariableStore } from '../../domain/ports/IVariableStore.js';
import { TYPES } from '../../types.js';

@injectable()
export class FileVariableStore implements IVariableStore {
  private logger: ILogger;

  constructor(@inject(TYPES.ILogger) logger: ILogger) {
    if (!logger) {
      throw new DependencyMissingError('Logger must be specified');
    }
    this.logger = logger;
  }

  async getMapping(source: string): Promise<Record<string, string>> {
    const { mappings } = await this.getParsedMapping(source);
    return mappings;
  }

  async getParsedMapping(source: string): Promise<ParsedMapFile> {
    const raw = await this.readJsonFile(source);
    const { $config, ...rest } = raw;
    const config: MapFileConfig =
      $config && typeof $config === 'object' ? $config : {};
    const mappings: Record<string, string> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (!key.startsWith('$') && typeof value === 'string') {
        mappings[key] = value;
      }
    }
    return { config, mappings };
  }

  private async readJsonFile(source: string): Promise<Record<string, unknown>> {
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
    const existingContent = await this.readExistingEnvContent(destination);
    const envContent = this.buildEnvContent(existingContent, envVariables);

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

  private async readExistingEnvContent(
    destination: string,
  ): Promise<string | null> {
    try {
      return await fs.readFile(destination, 'utf-8');
    } catch {
      return null;
    }
  }

  private buildEnvContent(
    existingContent: string | null,
    envVariables: Record<string, string>,
  ): string {
    const pending = { ...envVariables };

    if (existingContent === null) {
      return Object.entries(pending)
        .map(([key, value]) => `${key}=${this.escapeEnvValue(value)}`)
        .join('\n');
    }

    const assignmentRegex = /^(\s*(?:export\s+)?)([\w.-]+)(\s*=\s*)(.*)$/;
    const mergedLines = existingContent.split('\n').map((line) => {
      const match = assignmentRegex.exec(line);
      if (match === null) {
        return line;
      }
      const [, prefix, key, separator] = match;
      if (!Object.hasOwn(pending, key)) {
        return line;
      }
      const value = this.escapeEnvValue(pending[key]);
      delete pending[key];
      return `${prefix}${key}${separator}${value}`;
    });

    let result = mergedLines.join('\n');
    const appended = Object.entries(pending).map(
      ([key, value]) => `${key}=${this.escapeEnvValue(value)}`,
    );
    if (appended.length > 0) {
      const separator = result.length > 0 && !result.endsWith('\n') ? '\n' : '';
      result += separator + appended.join('\n');
    }
    return result;
  }

  private escapeEnvValue(value: string): string {
    // codeql[js/incomplete-sanitization]
    // CodeQL flags this as incomplete sanitization because we don't escape backslashes
    // before newlines. However, this is intentional: the dotenv library does NOT
    // interpret escape sequences (it treats \n literally as backslash+n, not as a newline).
    // Therefore, escaping backslashes would actually break the functionality by
    // doubling them when read back by dotenv. This is not a security issue in this context.
    return value.replace(/(\r\n|\n|\r)/g, '\\n');
  }
}

export async function readMapFileConfig(
  mapPath: string,
): Promise<MapFileConfig> {
  try {
    const content = await fs.readFile(mapPath, 'utf-8');
    try {
      const raw = JSON.parse(content);
      const config = raw.$config;
      return config && typeof config === 'object' ? config : {};
    } catch {
      throw new EnvironmentFileError(
        `Invalid JSON in parameter map file: ${mapPath}`,
      );
    }
  } catch (error) {
    if (error instanceof EnvironmentFileError) {
      throw error;
    }
    throw new EnvironmentFileError(`Failed to read map file: ${mapPath}`);
  }
}
