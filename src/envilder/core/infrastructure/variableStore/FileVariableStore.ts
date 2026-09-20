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

/** The delimiters dotenv recognizes for quoting a `.env` value. */
const ENV_QUOTES = ["'", '"', '`'] as const;
type EnvQuote = (typeof ENV_QUOTES)[number];

/**
 * dotenv's own `LINE` grammar, kept structurally identical to it and only
 * split into capture groups:
 *
 *     /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'
 *       |\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg
 *
 * Approximating that grammar instead of copying it is what repeatedly left old
 * secrets on disk: every form dotenv spans and we do not degrades into the
 * single-line branch, which rewrites the first physical line of an assignment
 * and abandons the rest of the previous value in the file. Cases that cost us a
 * round each — a closing delimiter followed by blanks, a colon separator, a
 * value that only starts on the next physical line — are all consequences of
 * the same divergence, so the grammar is now shared rather than re-derived.
 *
 * Everything except the value is captured and re-emitted verbatim, so groups
 * whose `\s` reaches across line breaks cannot lose structure: whatever they
 * consume, they put back.
 */
const ASSIGNMENT_PATTERN =
  /^(\s*(?:export\s+)?)([\w.-]+)(\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?(\s*)((?:#.*)?)$/gm;

/** The line break that closes a file, kept verbatim instead of normalized. */
const TRAILING_NEWLINE_PATTERN = /(?:\r\n|[\r\n])$/;

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
    const unmanagedValues = this.collectUnmanagedValues(
      existingContent,
      envVariables,
    );
    const envContent = this.buildEnvContent(existingContent, envVariables);
    this.assertValuesArePreserved(envContent, envVariables, unmanagedValues);

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
    const entries = Object.entries(envVariables);
    // A file we create ends with a line break, as a POSIX text file should:
    // without one, git reports "\ No newline at end of file" and any editor
    // configured to add one rewrites the file behind us. A file that already
    // exists keeps the ending it has, empty one included — that shape belongs
    // to whoever wrote it, and normalizing it is not ours to do.
    if (existingContent === null || existingContent === '') {
      const created = this.renderAssignments(entries).join('\n');
      return created === '' ? created : `${created}\n`;
    }

    // The body keeps its own line breaks: rewriting them would also rewrite the
    // line breaks a multiline value carries as payload.
    const trailingNewline =
      TRAILING_NEWLINE_PATTERN.exec(existingContent)?.[0] ?? '';
    const body = existingContent.slice(
      0,
      existingContent.length - trailingNewline.length,
    );
    const newline = this.detectStructuralNewline(body, trailingNewline);

    const updatedKeys = new Set<string>();
    const merged = body.replace(
      ASSIGNMENT_PATTERN,
      (
        assignment: string,
        prefix: string,
        key: string,
        separator: string,
        rawValue: string | undefined,
        padding: string,
        comment: string,
      ) => {
        if (!Object.hasOwn(envVariables, key)) {
          return assignment;
        }
        updatedKeys.add(key);
        // dotenv's `=\s*?` is lazy, so the blanks after it belong to the value
        // group. Put back the ones that stayed on the line, which is the
        // spacing the file chose; a value that only began on a later physical
        // line collapses onto the key's line instead, because that is how the
        // old one leaves.
        const leading = /^\s*/.exec(rawValue ?? '')?.[0] ?? '';
        const spacing = /[\r\n]/.test(leading) ? '' : leading;
        const value = this.serializeAssignmentValue(
          key,
          envVariables[key],
          rawValue ?? '',
        );
        return `${prefix}${key}${separator}${spacing}${value}${padding}${comment}`;
      },
    );

    this.assertNoManagedAssignmentSurvives(merged, envVariables);
    const appended = this.renderAssignments(
      entries.filter(([key]) => !updatedKeys.has(key)),
    );
    const content = [merged, ...appended].join(newline);
    return trailingNewline === '' ? content : content + trailingNewline;
  }

  /**
   * The break that separates two assignments, which is the only kind that is
   * structural. Blanking the claimed spans outright leaves exactly those: a
   * break carried inside a value is part of a span and disappears with it,
   * while a break between spans is in no span and survives. The terminator
   * that closes the file is structural by the same argument and wins when the
   * file has one; scanning the raw text for any CRLF is the last resort, and
   * only a guess.
   */
  private detectStructuralNewline(
    body: string,
    trailingNewline: string,
  ): string {
    if (trailingNewline !== '') {
      return trailingNewline;
    }
    const betweenSpans = body.replace(ASSIGNMENT_PATTERN, (assignment) =>
      ' '.repeat(assignment.length),
    );
    return (
      /\r\n|[\r\n]/.exec(betweenSpans)?.[0] ??
      (body.includes('\r\n') ? '\r\n' : '\n')
    );
  }

  /**
   * Whatever the merge pass did not claim as an assignment, read the way dotenv
   * reads it. A managed key still in there is an assignment our grammar could
   * not locate — one of several duplicates, or a form we do not span, such as a
   * colon whose value sits on the next line. Appending the new value would
   * satisfy a reader, because dotenv keeps the last duplicate, while the
   * previous secret stayed on disk and `assertValuesArePreserved` saw nothing
   * wrong. Refuse the write instead.
   */
  private assertNoManagedAssignmentSurvives(
    merged: string,
    envVariables: Record<string, string>,
  ): void {
    // Blank the claimed spans in place: dropping them would join the text
    // around them and invent assignments that were never there.
    const remainder = merged.replace(ASSIGNMENT_PATTERN, (assignment) =>
      assignment.replace(/[^\r\n]/g, ' '),
    );
    const stale = Object.keys(dotenv.parse(remainder))
      .filter((key) => Object.hasOwn(envVariables, key))
      .map((key) => `"${key}"`);
    if (stale.length === 0) {
      return;
    }
    // Names only: the values at stake are the secrets this guard protects.
    throw new EnvironmentFileError(
      `Cannot locate every existing assignment for ${stale.join(', ')}; the previous value would stay in the file, so nothing was written`,
    );
  }

  private renderAssignments(entries: Array<[string, string]>): string[] {
    return entries.map(
      ([key, value]) => `${key}=${this.serializeAssignmentValue(key, value)}`,
    );
  }

  /**
   * Serializes a value for a single `.env` assignment. Candidate
   * representations are tried in order of preference and accepted only once
   * `dotenv.parse` confirms the assignment yields exactly the intended
   * key/value, never by inspection alone. An existing delimiter (from
   * `originalValue`, when updating an existing assignment) is preferred but
   * only kept when it still round-trips for the new value.
   */
  private serializeAssignmentValue(
    key: string,
    value: string,
    originalValue?: string,
  ): string {
    const preferredQuote = this.detectExistingQuote(originalValue);
    for (const candidate of this.buildValueCandidates(value, preferredQuote)) {
      if (this.parsesBackTo(key, candidate, value)) {
        return candidate;
      }
    }
    throw new EnvironmentFileError(
      `Cannot represent the value for "${key}" in a dotenv-compatible format without data loss`,
    );
  }

  private buildValueCandidates(
    value: string,
    preferredQuote: EnvQuote | undefined,
  ): string[] {
    const hasLineBreak = /[\r\n]/.test(value);
    // Double quotes come first for multiline values because they are the only
    // delimiter whose escapes keep the assignment on one physical line.
    const quotes: readonly EnvQuote[] = hasLineBreak
      ? ['"', "'", '`']
      : ENV_QUOTES;
    const candidates: string[] = [];
    if (preferredQuote !== undefined) {
      candidates.push(...this.buildQuotedCandidates(value, preferredQuote));
    }
    if (!hasLineBreak) {
      candidates.push(value);
    }
    for (const quote of quotes) {
      candidates.push(...this.buildQuotedCandidates(value, quote));
    }
    return candidates;
  }

  private buildQuotedCandidates(value: string, quote: EnvQuote): string[] {
    if (!this.isDelimiterSafe(value, quote)) {
      return [];
    }
    const raw = `${quote}${value}${quote}`;
    if (quote !== '"') {
      return [raw];
    }
    // dotenv expands `\n`/`\r` only inside double quotes, so the encoded form
    // is the one that survives real line breaks and the raw form is the one
    // that survives values holding those sequences literally.
    return [`"${this.encodeLineBreaks(value)}"`, raw];
  }

  /**
   * dotenv consumes `\<delimiter>` as a single unit inside a quoted value, so
   * an escaped-looking delimiter stays literal while a bare one would close
   * the value early.
   */
  private isDelimiterSafe(value: string, quote: EnvQuote): boolean {
    for (
      let index = value.indexOf(quote);
      index !== -1;
      index = value.indexOf(quote, index + 1)
    ) {
      if (value[index - 1] !== '\\') {
        return false;
      }
    }
    return true;
  }

  private encodeLineBreaks(value: string): string {
    return value.replace(/[\r\n]/g, (match) =>
      match === '\n' ? '\\n' : '\\r',
    );
  }

  private detectExistingQuote(
    originalValue: string | undefined,
  ): EnvQuote | undefined {
    if (originalValue === undefined) {
      return undefined;
    }
    const trimmed = originalValue.trim();
    const quote = trimmed[0];
    const isQuoted =
      trimmed.length >= 2 &&
      (ENV_QUOTES as readonly string[]).includes(quote) &&
      trimmed[trimmed.length - 1] === quote;
    return isQuoted ? (quote as EnvQuote) : undefined;
  }

  private parsesBackTo(
    key: string,
    candidate: string,
    expected: string,
  ): boolean {
    const parsed = dotenv.parse(`${key}=${candidate}\n`);
    const parsedKeys = Object.keys(parsed);
    return (
      parsedKeys.length === 1 &&
      parsedKeys[0] === key &&
      parsed[key] === expected
    );
  }

  /**
   * The values the file already held for keys this run is not writing. Read
   * through `dotenv.parse` so duplicate keys collapse the same way a consumer
   * would see them.
   */
  /** Keys the file no longer reads back as the value they are meant to hold. */
  private keysThatLostTheirValue(
    parsed: Record<string, string>,
    expected: Record<string, string>,
  ): string[] {
    return Object.keys(expected).filter((key) => parsed[key] !== expected[key]);
  }

  /**
   * Keys the file gained. Nobody asked for them, so they can only come from our
   * grammar and dotenv's disagreeing about where some value ended.
   */
  private keysThatAppeared(
    parsed: Record<string, string>,
    ...accounted: Array<Record<string, string>>
  ): string[] {
    return Object.keys(parsed).filter(
      (key) => !accounted.some((group) => Object.hasOwn(group, key)),
    );
  }

  private collectUnmanagedValues(
    existingContent: string | null,
    envVariables: Record<string, string>,
  ): Record<string, string> {
    if (existingContent === null) {
      return {};
    }
    const unmanaged: Record<string, string> = {};
    for (const [key, value] of Object.entries(dotenv.parse(existingContent))) {
      if (!Object.hasOwn(envVariables, key)) {
        unmanaged[key] = value;
      }
    }
    return unmanaged;
  }

  /**
   * Reads the result back with dotenv before it reaches disk: every managed key
   * must yield the value we were asked to store, every key we did not manage
   * must yield the value the file already had, and no third key may appear
   * because our grammar and dotenv's disagreed on where a value ended.
   */
  private assertValuesArePreserved(
    content: string,
    envVariables: Record<string, string>,
    unmanagedValues: Record<string, string>,
  ): void {
    const parsed = dotenv.parse(content);
    const affectedKeys = new Set([
      ...this.keysThatLostTheirValue(parsed, envVariables),
      ...this.keysThatLostTheirValue(parsed, unmanagedValues),
      ...this.keysThatAppeared(parsed, envVariables, unmanagedValues),
    ]);
    if (affectedKeys.size === 0) {
      return;
    }
    // Names only: the values at stake are the secrets this guard protects.
    const keys = [...affectedKeys].map((key) => `"${key}"`).join(', ');
    throw new EnvironmentFileError(
      `Cannot write the environment file without losing or altering ${keys}; nothing was written`,
    );
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
