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
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        return null;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to read environment file: ${message}`);
      throw new EnvironmentFileError(
        `Failed to read environment file: ${message}`,
      );
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

    const newline = existingContent.includes('\r\n') ? '\r\n' : '\n';
    const hasTrailingNewline = /\r?\n$/.test(existingContent);
    const lines = existingContent === '' ? [] : existingContent.split(/\r?\n/);
    if (hasTrailingNewline) {
      lines.pop();
    }

    const assignmentRegex = /^(\s*(?:export\s+)?)([\w.-]+)(\s*=\s*)(.*)$/;
    const updatedKeys = new Set<string>();
    const mergedLines = lines.map((line) => {
      const match = assignmentRegex.exec(line);
      if (match === null) {
        return line;
      }
      const [, prefix, key, separator, originalValue] = match;
      if (!Object.hasOwn(pending, key)) {
        return line;
      }
      updatedKeys.add(key);
      const value = this.formatValue(pending[key], originalValue);
      return `${prefix}${key}${separator}${value}`;
    });
    for (const key of updatedKeys) {
      delete pending[key];
    }

    const appended = Object.entries(pending).map(
      ([key, value]) => `${key}=${this.escapeEnvValue(value)}`,
    );
    const allLines =
      appended.length > 0 ? [...mergedLines, ...appended] : mergedLines;
    const result = allLines.join(newline);
    return hasTrailingNewline ? result + newline : result;
  }

  private formatValue(newValue: string, originalValue: string): string {
    const trimmed = originalValue.trim();
    const quote = trimmed[0];
    const isQuoted =
      trimmed.length >= 2 &&
      (quote === '"' || quote === "'") &&
      trimmed[trimmed.length - 1] === quote;
    // Only keep the original quotes when the new value can be wrapped safely.
    // A value containing the same quote, a backslash, or a newline would
    // produce a string dotenv cannot parse back, so fall back to the
    // unquoted escaped form instead of corrupting the value.
    const isSafeToWrap =
      !newValue.includes(quote) &&
      !newValue.includes('\\') &&
      !/[\r\n]/.test(newValue);
    if (isQuoted && isSafeToWrap) {
      return `${quote}${newValue}${quote}`;
    }
    return this.escapeEnvValue(newValue);
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
