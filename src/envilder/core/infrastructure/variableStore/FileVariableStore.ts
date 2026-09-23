import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import { inject, injectable } from 'inversify';
import {
  invalidEnvironmentVariableNameMessage,
  isValidEnvironmentVariableName,
} from '../../domain/EnvironmentVariableName.js';
import {
  DependencyMissingError,
  EnvironmentFileError,
  InvalidArgumentError,
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
 * Follows dotenv's own `LINE` grammar rather than re-deriving it, split into
 * capture groups, with the two deliberate narrowings noted at the end:
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
 *
 * `(?<!\r)$` is the one place the raw text needs more than dotenv's grammar
 * says. dotenv rewrites every CRLF to LF before it matches, so it never sees
 * the position between a CR and its LF; we match the file as it is, where `$`
 * does match there and would let a separator whose `\s` had just taken the CR
 * end the assignment early, leaving the rest of the value behind a bare
 * carriage return.
 *
 * Two places stay deliberately narrower than dotenv, because dotenv only has to
 * find where a value ends while we also have to put the surroundings back. The
 * trailing padding is horizontal, so a comment on the next line stays outside
 * the span and the break before it is still visible as structure; and the
 * unquoted run is lazy, so the blanks before an inline comment land in the
 * padding we re-emit instead of inside the value we replace. Neither narrows
 * the value span itself, which is the part that has to agree with dotenv.
 */
const ASSIGNMENT_PATTERN =
  /^(\s*(?:export\s+)?)([\w.-]+)(\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]*?)([^\S\r\n]*)((?:#.*)?)(?<!\r)$/gm;

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
    // Null-prototype: map-file keys are untrusted, and a plain object literal
    // would route `__proto__` through the Object.prototype setter, silently
    // dropping that mapping instead of storing it as data.
    const mappings: Record<string, string> = Object.create(null);
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith('$')) {
        continue;
      }
      // Before the non-string filter, so the name rule covers every mapping
      // key the file declares. Validating after would accept a name the
      // published schema rejects whenever its value happened to be a number
      // or an object. Non-string values are still skipped, not an error.
      this.assertValidVariableName(key);
      if (typeof value !== 'string') {
        continue;
      }
      mappings[key] = value;
    }
    return { config, mappings };
  }

  private assertValidVariableName(name: string): void {
    if (!isValidEnvironmentVariableName(name)) {
      throw new InvalidArgumentError(
        invalidEnvironmentVariableNameMessage(name),
      );
    }
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
    // Null-prototype for the same reason as the parsed mappings: callers
    // assign resolved secrets straight into this map, and a plain object
    // would route a prototype-shadowing key through an inherited setter.
    const envVariables: Record<string, string> = Object.create(null);
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
    for (const key of Object.keys(envVariables)) {
      this.assertValidVariableName(key);
    }

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
    // configured to add one rewrites the file behind us. An existing file that
    // is empty counts as one we create, since there is no shape to preserve;
    // one with content keeps the ending it has, missing ending included, because
    // that shape belongs to whoever wrote it.
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
        // An assignment that already says the right thing is left exactly as
        // it is. The CLI hands us every key it read, not just the mapped ones,
        // so rewriting on sight would reserialize untouched entries and churn
        // bytes no reader can see: a CRLF carried inside a value, a span that
        // spreads over two physical lines. Leaving them also makes a run with
        // nothing to change produce a byte-identical file.
        if (this.parsesBackTo(key, rawValue ?? '', envVariables[key])) {
          return assignment;
        }
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
   * structural. Blanking the claimed spans leaves exactly those: a break
   * carried inside a value is part of a span and disappears with it, while a
   * break that precedes a span is kept, because the prefix reaches back over
   * blank lines and over the break that ended the line before. The terminator
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
    const betweenSpans = body.replace(
      ASSIGNMENT_PATTERN,
      (assignment: string, prefix: string) =>
        // The breaks a span holds in its prefix are the ones that separate it
        // from what came before, so they survive the blanking; everything else
        // it holds, line breaks included, is payload and goes.
        prefix.replace(/[^\r\n]/g, ' ') +
        ' '.repeat(assignment.length - prefix.length),
    );
    return (
      /\r\n|[\r\n]/.exec(betweenSpans)?.[0] ??
      (body.includes('\r\n') ? '\r\n' : '\n')
    );
  }

  /**
   * That the pattern and dotenv agree on where an assignment ends is an
   * invariant, so assert it rather than assume it. Whatever the merge pass did
   * not claim is read the way dotenv reads it, and a managed key still in there
   * is an assignment dotenv can see and we missed. Appending the new value
   * would satisfy a reader, because dotenv keeps the last duplicate, while the
   * previous secret stayed on disk and `assertValuesArePreserved` saw nothing
   * wrong, so refuse the write instead.
   *
   * No supported syntax reaches this today: the grammar is shared with dotenv
   * precisely so that none can, and every form that once did — duplicates, a
   * colon separator, a value starting on the next physical line — is claimed
   * and replaced. This is the net for the day the two drift apart, which
   * declaring `dotenv` as `^17.4.2` leaves open.
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

  /**
   * The values the file already held for keys this run is not writing. Read
   * through `dotenv.parse` so duplicate keys collapse the same way a consumer
   * would see them.
   */
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
