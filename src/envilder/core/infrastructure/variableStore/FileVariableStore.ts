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

type EnvDocument = {
  lines: string[];
  newline: '\n' | '\r\n';
  hasTrailingNewline: boolean;
};

type QuotedAssignment = {
  end: number;
  quote: '"' | "'";
  suffix: string;
};

type LineReplacement = {
  line: string;
  end: number;
  updatedKey: string | null;
};

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
    if (existingContent === null) {
      return this.formatAssignments(envVariables).join('\n');
    }

    const pending = { ...envVariables };
    const document = this.parseEnvDocument(existingContent);
    const { lines, updatedKeys } = this.replaceAssignments(
      document.lines,
      pending,
    );
    this.removeUpdatedVariables(pending, updatedKeys);
    lines.push(...this.formatAssignments(pending));

    return this.renderEnvDocument(lines, document);
  }

  private parseEnvDocument(content: string): EnvDocument {
    const newline = content.includes('\r\n') ? '\r\n' : '\n';
    const hasTrailingNewline = /\r?\n$/.test(content);
    const lines = content === '' ? [] : content.split(/\r?\n/);
    if (hasTrailingNewline) {
      lines.pop();
    }
    return { lines, newline, hasTrailingNewline };
  }

  private replaceAssignments(
    lines: string[],
    pending: Record<string, string>,
  ): { lines: string[]; updatedKeys: Set<string> } {
    const mergedLines: string[] = [];
    const updatedKeys = new Set<string>();
    for (let index = 0; index < lines.length; index++) {
      const replacement = this.replaceAssignment(lines, index, pending);
      mergedLines.push(replacement.line);
      index = replacement.end;
      if (replacement.updatedKey !== null) {
        updatedKeys.add(replacement.updatedKey);
      }
    }
    return { lines: mergedLines, updatedKeys };
  }

  private replaceAssignment(
    lines: string[],
    index: number,
    pending: Record<string, string>,
  ): LineReplacement {
    const assignmentRegex = /^(\s*(?:export\s+)?)([\w.-]+)(\s*=\s*)(.*)$/;
    const line = lines[index];
    const match = assignmentRegex.exec(line);
    if (match === null) {
      return { line, end: index, updatedKey: null };
    }
    const [, prefix, key, separator, originalValue] = match;
    if (!Object.hasOwn(pending, key)) {
      return { line, end: index, updatedKey: null };
    }

    const quotedAssignment = this.findQuotedAssignment(
      lines,
      index,
      originalValue,
    );
    const value = this.formatValue(
      pending[key],
      quotedAssignment?.quote,
      quotedAssignment?.suffix,
    );
    return {
      line: `${prefix}${key}${separator}${value}`,
      end: quotedAssignment?.end ?? index,
      updatedKey: key,
    };
  }

  private removeUpdatedVariables(
    pending: Record<string, string>,
    updatedKeys: Set<string>,
  ): void {
    for (const key of updatedKeys) {
      delete pending[key];
    }
  }

  private formatAssignments(variables: Record<string, string>): string[] {
    return Object.entries(variables).map(
      ([key, value]) => `${key}=${this.escapeEnvValue(value)}`,
    );
  }

  private renderEnvDocument(lines: string[], document: EnvDocument): string {
    const result = lines.join(document.newline);
    return document.hasTrailingNewline ? result + document.newline : result;
  }

  private findQuotedAssignment(
    lines: string[],
    assignmentStart: number,
    originalValue: string,
  ): QuotedAssignment | null {
    const trimmedStart = originalValue.trimStart();
    const quote = this.getOpeningQuote(trimmedStart);
    if (quote === null) {
      return null;
    }

    return this.findQuotedAssignmentEnd(
      lines,
      assignmentStart,
      trimmedStart,
      quote,
    );
  }

  private getOpeningQuote(value: string): '"' | "'" | null {
    const quote = value[0];
    if (quote === '"' || quote === "'") {
      return quote;
    }
    return null;
  }

  private findQuotedAssignmentEnd(
    lines: string[],
    assignmentStart: number,
    trimmedStart: string,
    quote: '"' | "'",
  ): QuotedAssignment | null {
    for (let index = assignmentStart; index < lines.length; index++) {
      const valueLine =
        index === assignmentStart ? trimmedStart.slice(1) : lines[index];
      const candidate = this.getQuotedAssignmentCandidate(
        valueLine,
        index,
        quote,
      );
      if (candidate !== undefined) {
        return candidate;
      }
    }
    return null;
  }

  private getQuotedAssignmentCandidate(
    valueLine: string,
    index: number,
    quote: '"' | "'",
  ): QuotedAssignment | null | undefined {
    const closingQuoteIndex = this.findUnescapedQuote(valueLine, quote);
    if (closingQuoteIndex < 0) {
      return undefined;
    }
    const suffix = valueLine.slice(closingQuoteIndex + 1);
    if (!/^\s*(?:#.*)?$/.test(suffix)) {
      return null;
    }
    return { end: index, quote, suffix };
  }

  private findUnescapedQuote(value: string, quote: '"' | "'"): number {
    for (let index = 0; index < value.length; index++) {
      if (value[index] === quote && !this.isEscaped(value, index)) {
        return index;
      }
    }
    return -1;
  }

  private isEscaped(value: string, index: number): boolean {
    let backslashCount = 0;
    for (let cursor = index - 1; cursor >= 0; cursor--) {
      if (value[cursor] !== '\\') {
        break;
      }
      backslashCount++;
    }
    return backslashCount % 2 === 1;
  }

  private formatValue(
    newValue: string,
    quote?: '"' | "'",
    suffix = '',
  ): string {
    if (quote === undefined) {
      return `${this.escapeEnvValue(newValue)}${suffix}`;
    }
    if (!this.canPreserveQuote(newValue, quote)) {
      return `${this.escapeEnvValue(newValue)}${suffix}`;
    }
    return `${quote}${newValue}${quote}${suffix}`;
  }

  private canPreserveQuote(newValue: string, quote: '"' | "'"): boolean {
    return (
      !newValue.includes(quote) &&
      !newValue.includes('\\') &&
      !/[\r\n]/.test(newValue)
    );
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
