import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvironmentFileError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { ConsoleLogger } from '../../../../../src/envilder/core/infrastructure/logger/ConsoleLogger';
import {
  FileVariableStore,
  readMapFileConfig,
} from '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore';

vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual('node:fs/promises');
  return {
    ...(actual as object),
    writeFile: vi.fn((path, content) => {
      // Store mock file content in memory
      mockInMemoryFiles.set(path, content);
      return Promise.resolve();
    }),
    readFile: vi.fn((path, _encoding) => {
      if (mockInMemoryFiles.has(path)) {
        return Promise.resolve(mockInMemoryFiles.get(path));
      }
      // For non-existent files, behave like real fs
      const error = new Error(
        `ENOENT: no such file or directory, open '${path}'`,
      ) as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      return Promise.reject(error);
    }),
    access: vi.fn((path) => {
      if (mockInMemoryFiles.has(path)) {
        return Promise.resolve();
      }
      return Promise.reject(
        new Error(`ENOENT: no such file or directory, access '${path}'`),
      );
    }),
    unlink: vi.fn((path) => {
      mockInMemoryFiles.delete(path);
      return Promise.resolve();
    }),
  };
});

const mockInMemoryFiles = new Map<string, string>();

const LF = '\n';
const CRLF = '\r\n';

/** The three delimiters dotenv accepts around a value. */
const ENV_QUOTE_STYLES = [
  { name: 'double', quote: '"' },
  { name: 'single', quote: "'" },
  { name: 'backtick', quote: '`' },
];

/**
 * Every file shape that changes where an assignment span starts and ends: each
 * delimiter, both line endings, and whether the file ends with one. Written out
 * instead of generated so the coverage reads at a glance.
 */
const MULTILINE_FILE_SHAPES = [
  {
    name: 'double quotes, LF, no final newline',
    quote: '"',
    newline: LF,
    trailing: '',
  },
  {
    name: 'double quotes, LF, final newline',
    quote: '"',
    newline: LF,
    trailing: LF,
  },
  {
    name: 'double quotes, CRLF, no final newline',
    quote: '"',
    newline: CRLF,
    trailing: '',
  },
  {
    name: 'double quotes, CRLF, final newline',
    quote: '"',
    newline: CRLF,
    trailing: CRLF,
  },
  {
    name: 'single quotes, LF, no final newline',
    quote: "'",
    newline: LF,
    trailing: '',
  },
  {
    name: 'single quotes, LF, final newline',
    quote: "'",
    newline: LF,
    trailing: LF,
  },
  {
    name: 'single quotes, CRLF, no final newline',
    quote: "'",
    newline: CRLF,
    trailing: '',
  },
  {
    name: 'single quotes, CRLF, final newline',
    quote: "'",
    newline: CRLF,
    trailing: CRLF,
  },
  {
    name: 'backticks, LF, no final newline',
    quote: '`',
    newline: LF,
    trailing: '',
  },
  {
    name: 'backticks, LF, final newline',
    quote: '`',
    newline: LF,
    trailing: LF,
  },
  {
    name: 'backticks, CRLF, no final newline',
    quote: '`',
    newline: CRLF,
    trailing: '',
  },
  {
    name: 'backticks, CRLF, final newline',
    quote: '`',
    newline: CRLF,
    trailing: CRLF,
  },
];

describe('FileVariableStore', () => {
  let sut: FileVariableStore;

  const mockMapPath = './tests/escaping-map.json';
  const mockEnvFilePath = './tests/.env.escaping.test';
  const invalidJsonPath = './tests/invalid-map.json';

  beforeEach(() => {
    sut = new FileVariableStore(new ConsoleLogger());
  });

  afterEach(async () => {
    vi.clearAllMocks();
    mockInMemoryFiles.clear();
  });

  function escapeForEnvFile(value: string): string {
    return value.replace(/(\r\n|\n|\r)/g, '\\n');
  }

  describe('constructor', () => {
    it('Should_ThrowError_When_LoggerIsMissing', () => {
      // Act
      const action = () =>
        new FileVariableStore(undefined as unknown as ConsoleLogger);

      // Assert
      expect(action).toThrow('Logger must be specified');
    });
  });

  describe('saveEnvFile', () => {
    it('Should_EscapeBackslashes_When_WritingEnvFile', async () => {
      // Arrange
      const expected = 'value\\with\\backslashes';
      const envVars = { BACKSLASH_VAR: expected };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`BACKSLASH_VAR=${escapeForEnvFile(expected)}\n`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.BACKSLASH_VAR).toBe(expected);
    });

    it('Should_EscapeNewlines_When_WritingEnvFile', async () => {
      // Arrange
      const expected = 'value\\nwith\\nnewlines';
      const envVars = { NEWLINE_VAR: expected };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`NEWLINE_VAR=${escapeForEnvFile(expected)}\n`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.NEWLINE_VAR).toBe(expected);
    });

    it('Should_EscapeQuotes_When_WritingEnvFile', async () => {
      // Arrange
      const expected = 'value"with"quotes';
      const envVars = { QUOTE_VAR: expected };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`QUOTE_VAR=${escapeForEnvFile(expected)}\n`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.QUOTE_VAR).toBe(expected);
    });

    it('Should_HandleCombinationOfSpecialCharacters_When_WritingEnvFile', async () => {
      // Arrange
      const expected = 'value"with"\\neverything\\combined';
      const envVars = { COMBINED_VAR: expected };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`COMBINED_VAR=${escapeForEnvFile(expected)}\n`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.COMBINED_VAR).toBe(expected);
    });

    it('Should_HandleAlreadyEscapedStrings_When_WritingEnvFile', async () => {
      // Arrange
      const input = 'value\\already\\escaped';
      const envVars = { ESCAPED_VAR: input };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`ESCAPED_VAR=${escapeForEnvFile(input)}\n`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.ESCAPED_VAR).toBe(input);
    });

    it('Should_EndWithALineBreak_When_CreatingAFreshEnvFile', async () => {
      // Act
      await sut.saveEnvironment(mockEnvFilePath, { FIRST: 'a', SECOND: 'b' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe('FIRST=a\nSECOND=b\n');
    });

    it('Should_EndWithALineBreak_When_FillingAnEmptyEnvFile', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, '');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { FIRST: 'a' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe('FIRST=a\n');
    });

    it('Should_LeaveTheEndingAlone_When_UpdatingAFileThatHasNoFinalLineBreak', async () => {
      // Arrange: the convention applies to files we create. One that already
      // exists keeps the shape its author gave it, missing ending included.
      mockInMemoryFiles.set(mockEnvFilePath, 'KEEP=ok\nTOKEN=old');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe('KEEP=ok\nTOKEN=new');
    });

    it('Should_RoundTripDotenvRepresentableValues_When_CreatingFreshEnvFile', async () => {
      // Arrange
      const expected: Record<string, string> = {
        HASH_VAR: 'alpha#beta',
        PADDED_VAR: '  padded value  ',
        QUOTE_VAR: `she said "hi" and 'bye'`,
        BACKSLASH_VAR: 'back\\slash\\value',
        LF_VAR: 'line1\nline2',
        CRLF_VAR: 'line1\r\nline2',
        LITERAL_N_VAR: 'value\\nwith\\nliteral',
        LITERAL_R_VAR: 'value\\rwith\\rliteral',
        BACKTICK_REQUIRED_VAR: ` she said "hi" and 'bye' `,
        BACKTICK_LITERAL_VAR: 'uses ` and #tag',
      };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, expected);

      // Assert
      const savedText = mockInMemoryFiles.get(mockEnvFilePath) as string;
      const actual = dotenv.parse(savedText);
      expect(actual).toEqual(expected);
    });

    it('Should_RoundTripDotenvRepresentableValues_When_UpdatingExistingEnvFile', async () => {
      // Arrange
      const expected: Record<string, string> = {
        HASH_VAR: 'alpha#beta',
        PADDED_VAR: '  padded value  ',
        QUOTE_VAR: `she said "hi" and 'bye'`,
        BACKSLASH_VAR: 'back\\slash\\value',
        LF_VAR: 'line1\nline2',
        CRLF_VAR: 'line1\r\nline2',
        LITERAL_N_VAR: 'value\\nwith\\nliteral',
        LITERAL_R_VAR: 'value\\rwith\\rliteral',
        BACKTICK_REQUIRED_VAR: ` she said "hi" and 'bye' `,
        BACKTICK_LITERAL_VAR: 'uses ` and #tag',
      };
      const existing = Object.keys(expected)
        .map((key) => `${key}=old-value`)
        .join('\n');
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, expected);

      // Assert
      const savedText = mockInMemoryFiles.get(mockEnvFilePath) as string;
      const actual = dotenv.parse(savedText);
      expect(actual).toEqual(expected);
    });

    it('Should_RoundTripValueWithNewlineQuoteAndLiteralBackslashN_When_CreatingFreshEnvFile', async () => {
      // Arrange
      const expected = 'He said "hi"\nAnd wrote \\n literally';

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { MIXED_VAR: expected });

      // Assert
      const savedText = mockInMemoryFiles.get(mockEnvFilePath) as string;
      const actual = dotenv.parse(savedText);
      expect(actual.MIXED_VAR).toBe(expected);
    });

    it('Should_RoundTripPaddedValueEndingInBackslash_When_CreatingFreshEnvFile', async () => {
      // Arrange
      const expected = '  padded value\\';

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        PADDED_BACKSLASH_VAR: expected,
      });

      // Assert
      const savedText = mockInMemoryFiles.get(mockEnvFilePath) as string;
      const actual = dotenv.parse(savedText);
      expect(actual.PADDED_BACKSLASH_VAR).toBe(expected);
    });

    it('Should_RoundTripValueContainingBackslashDelimiterLookalike_When_UpdatingSingleQuotedAssignment', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, "SECRET='old'\n");
      const expected = "data \\' with escaped-looking delimiter";

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { SECRET: expected });

      // Assert
      const savedText = mockInMemoryFiles.get(mockEnvFilePath) as string;
      const actual = dotenv.parse(savedText);
      expect(actual.SECRET).toBe(expected);
    });

    it('Should_ReplaceEntireMultilineAssignmentSpan_When_UpdatingExistingQuotedValue', async () => {
      // Arrange
      const existing = 'MULTI_VAR="prefix\nSNEAKY=leaked"\nOTHER=other-value\n';
      mockInMemoryFiles.set(mockEnvFilePath, existing);
      const expected = { MULTI_VAR: 'updated-value', OTHER: 'other-value' };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        MULTI_VAR: 'updated-value',
      });

      // Assert
      const savedText = mockInMemoryFiles.get(mockEnvFilePath) as string;
      const actual = dotenv.parse(savedText);
      expect(actual).toEqual(expected);
    });

    describe.each(MULTILINE_FILE_SHAPES)(
      'multiline assignment in a file with $name',
      ({ quote, newline, trailing }) => {
        it('Should_ReplaceEntireAssignment_When_ExistingSecretSpansMultipleLines', async () => {
          // Arrange
          const staleFragment = 'old-continuation';
          const existing = [
            '# Preserved header',
            'BEFORE=keep-before',
            '',
            `TOKEN=${quote}old-first`,
            `${staleFragment}${quote}`,
            '# Preserved footer',
            'AFTER=keep-after',
            '',
            'LAST=keep-last',
          ].join(newline);
          const expected = [
            '# Preserved header',
            'BEFORE=keep-before',
            '',
            `TOKEN=${quote}new-value${quote}`,
            '# Preserved footer',
            'AFTER=keep-after',
            '',
            'LAST=keep-last',
          ].join(newline);
          mockInMemoryFiles.set(mockEnvFilePath, existing + trailing);

          // Act
          await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

          // Assert
          const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
          expect(actual).not.toContain(staleFragment);
          expect(actual).toBe(expected + trailing);
        });

        it('Should_ReplaceEntireAssignment_When_ClosingDelimiterIsFollowedByBlanks', async () => {
          // Arrange
          const staleFragment = 'old-continuation';
          const existing = [
            `TOKEN=${quote}old-first`,
            `${staleFragment}${quote}   `,
            'KEEP=keep-me',
          ].join(newline);
          const expected = [
            `TOKEN=${quote}new-value${quote}   `,
            'KEEP=keep-me',
          ].join(newline);
          mockInMemoryFiles.set(mockEnvFilePath, existing + trailing);

          // Act
          await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

          // Assert
          const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
          expect(actual).not.toContain(staleFragment);
          expect(dotenv.parse(actual)).toEqual({
            TOKEN: 'new-value',
            KEEP: 'keep-me',
          });
          expect(actual).toBe(expected + trailing);
        });
      },
    );

    describe.each(ENV_QUOTE_STYLES)(
      '$name-quoted multiline assignment',
      ({ quote }) => {
        it('Should_PreserveInlineComment_When_ReplacingMultilineAssignment', async () => {
          // Arrange
          mockInMemoryFiles.set(
            mockEnvFilePath,
            [
              `TOKEN=${quote}old-first`,
              `stale-tail${quote} # keep`,
              'AFTER=ok',
            ].join('\n'),
          );
          const expected = [
            `TOKEN=${quote}new-value${quote} # keep`,
            'AFTER=ok',
          ].join('\n');

          // Act
          await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

          // Assert
          const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
          expect(actual).not.toContain('stale-tail');
          expect(actual).toBe(expected);
        });

        it('Should_IgnoreEscapedDelimiter_When_ReplacingMultilineAssignment', async () => {
          // Arrange
          mockInMemoryFiles.set(
            mockEnvFilePath,
            [
              `TOKEN=${quote}old \\${quote} alias`,
              `another \\${quote} alias`,
              `stale-tail${quote}`,
              'AFTER=ok',
            ].join('\n'),
          );
          const expected = [`TOKEN=${quote}new-value${quote}`, 'AFTER=ok'].join(
            '\n',
          );

          // Act
          await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

          // Assert
          const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
          expect(actual).not.toContain('stale-tail');
          expect(actual).toBe(expected);
        });

        it('Should_PreserveFollowingContent_When_MultilineAssignmentIsUnclosed', async () => {
          // Arrange
          mockInMemoryFiles.set(
            mockEnvFilePath,
            [
              `TOKEN=${quote}unterminated`,
              '# Must remain unrelated',
              'AFTER=keep-after',
            ].join('\n'),
          );

          // Act
          await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

          // Assert
          const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
          expect(actual).toBe(
            [
              'TOKEN=new-value',
              '# Must remain unrelated',
              'AFTER=keep-after',
            ].join('\n'),
          );
        });
      },
    );

    it('Should_ReplaceEntireAssignment_When_ClosingQuoteFollowsEvenBackslashes', async () => {
      // Arrange
      mockInMemoryFiles.set(
        mockEnvFilePath,
        ['TOKEN="old-first', 'stale-tail\\\\" # keep', 'AFTER=ok'].join('\n'),
      );
      const expected = ['TOKEN="new-value" # keep', 'AFTER=ok'].join('\n');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain('stale-tail');
      expect(actual).toBe(expected);
    });

    it('Should_PreserveUnrelatedQuotedLines_When_ClosingQuoteHasInvalidSuffix', async () => {
      // Arrange
      const existing = [
        "TOKEN='old-first",
        "stale-tail'junk",
        "# Unrelated note'",
        'AFTER=ok',
      ].join('\n');
      mockInMemoryFiles.set(mockEnvFilePath, existing);
      const expected = [
        'TOKEN=new-value',
        "stale-tail'junk",
        "# Unrelated note'",
        'AFTER=ok',
      ].join('\n');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe(expected);
    });

    it('Should_ReplaceEntireAssignment_When_MultilineAssignmentIsExported', async () => {
      // Arrange
      mockInMemoryFiles.set(
        mockEnvFilePath,
        ['export TOKEN="old-first', 'stale-tail"', 'AFTER=ok'].join('\n'),
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'new-value' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain('stale-tail');
      expect(actual).toBe(['export TOKEN="new-value"', 'AFTER=ok'].join('\n'));
    });

    it('Should_KeepTrailingBlanks_When_UpdatingSingleLineQuotedAssignment', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, 'DB_HOST="old-host"   \nKEEP=ok');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { DB_HOST: 'new-host' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe('DB_HOST="new-host"   \nKEEP=ok');
    });

    it('Should_ThrowBeforeWritingWithoutLeakingSecret_When_ValueIsGenuinelyUnrepresentable', async () => {
      // Arrange
      const existing = 'OTHER=old-value\n';
      mockInMemoryFiles.set(mockEnvFilePath, existing);
      const secret = 'has \' single and " double and ` backtick\nacross lines';
      const action = () =>
        sut.saveEnvironment(mockEnvFilePath, {
          OTHER: 'new-value',
          UNREPRESENTABLE: secret,
        });

      // Act
      const actual = await action().then(
        () => null,
        (error: unknown) => error,
      );

      // Assert
      expect(actual).toBeInstanceOf(EnvironmentFileError);
      expect((actual as Error).message).not.toContain(secret);
      expect(vi.mocked(fs.writeFile)).not.toHaveBeenCalled();
      expect(mockInMemoryFiles.get(mockEnvFilePath)).toBe(existing);
    });

    it('Should_RemoveOldSecretWithoutDuplicatingKey_When_UpdatingBomPrefixedAssignment', async () => {
      // Arrange
      const existing = '\uFEFFSECRET=old-secret\n';
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { SECRET: 'new-secret' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      const parsed = dotenv.parse(actual);
      expect(parsed.SECRET).toBe('new-secret');
      expect(actual).not.toContain('old-secret');
      expect((actual.match(/SECRET=/g) ?? []).length).toBe(1);
    });

    it('Should_PreserveInlineCommentAndExactSecret_When_UpdateForcesQuoting', async () => {
      // Arrange
      const existing = 'API_KEY=old-key # keep this note\n';
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { API_KEY: 'sec#ret' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(dotenv.parse(actual).API_KEY).toBe('sec#ret');
      expect(actual).toContain('# keep this note');
    });

    it('Should_RemoveTheWholeBlock_When_AnOrphanQuoteIsTheManagedValue', async () => {
      // Arrange: dotenv reads everything up to the closing quote as
      // MANAGED_KEY's value, so replacing that value removes the block, and the
      // DB_PASSWORD line hidden inside it goes with it rather than surfacing.
      const originalSecret = 'super-secret-value';
      const hiddenText = 'leaked-value';
      const existing = `DB_PASSWORD=${originalSecret}\nMANAGED_KEY=\n"orphan\nDB_PASSWORD=${hiddenText}"\n`;
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        MANAGED_KEY: 'updated-value',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(hiddenText);
      expect(actual).not.toContain('orphan');
      expect(dotenv.parse(actual)).toEqual({
        DB_PASSWORD: originalSecret,
        MANAGED_KEY: 'updated-value',
      });
    });

    it('Should_RemoveStaleSecret_When_ColonDuplicateFollowsAnOrphanQuote', async () => {
      // Arrange
      const originalSecret = 'real-secret';
      const staleText = 'leaked';
      const existing = `SECRET=${originalSecret}\nMANAGED=\n"orphan\nSECRET: ${staleText}"\n`;
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        SECRET: originalSecret,
        MANAGED: 'updated-value',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(staleText);
      expect(dotenv.parse(actual)).toEqual({
        SECRET: originalSecret,
        MANAGED: 'updated-value',
      });
    });

    it('Should_ReplaceInPlaceKeepingSeparator_When_ExistingAssignmentUsesAColon', async () => {
      // Arrange
      const staleSecret = 'old-secret';
      mockInMemoryFiles.set(
        mockEnvFilePath,
        `DB_PASSWORD: ${staleSecret}\nKEEP=ok\n`,
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        DB_PASSWORD: 'new-secret',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(staleSecret);
      expect(actual).toBe('DB_PASSWORD: new-secret\nKEEP=ok\n');
      expect((actual.match(/DB_PASSWORD/g) ?? []).length).toBe(1);
    });

    it('Should_ReplaceInPlace_When_AColonValueStartsOnTheNextLine', async () => {
      // Arrange
      const staleSecret = 'old-secret';
      mockInMemoryFiles.set(
        mockEnvFilePath,
        `SECRET:\n  ${staleSecret}\nKEEP=ok\n`,
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { SECRET: 'new-secret' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(staleSecret);
      expect(actual).toBe('SECRET:\n  new-secret\nKEEP=ok\n');
    });

    it('Should_ReplaceInPlace_When_AColonValueStartsOnTheNextLineOfACrlfFile', async () => {
      // Arrange: `$` also matches between a CR and its LF, so the separator
      // could end the assignment there and strand the value on the next line.
      const staleSecret = 'old-secret';
      mockInMemoryFiles.set(
        mockEnvFilePath,
        `SECRET:\r\n  ${staleSecret}\r\nKEEP=ok\r\n`,
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { SECRET: 'new-secret' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(staleSecret);
      expect(actual).toBe('SECRET:\r\n  new-secret\r\nKEEP=ok\r\n');
    });

    it('Should_LeaveTheNextLineAlone_When_AnEqualsAssignmentHasNoValue', async () => {
      // Arrange: dotenv's unquoted branch cannot cross a line break, so it
      // reads this as an empty value and the indented line is loose text, not
      // the secret. Agreeing with the parser means leaving that text alone.
      const existing = 'SECRET=\r\n  loose text\r\nKEEP=ok\r\n';
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { SECRET: 'new-secret' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(dotenv.parse(existing).SECRET).toBe('');
      expect(actual).toBe('SECRET=new-secret\r\n  loose text\r\nKEEP=ok\r\n');
    });

    it('Should_ReplaceInPlace_When_AnEqualsValueStartsOnTheNextLine', async () => {
      // Arrange
      const staleSecret = 'old-secret';
      mockInMemoryFiles.set(
        mockEnvFilePath,
        `SECRET=\n"${staleSecret}"\nKEEP=ok\n`,
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { SECRET: 'new-secret' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(staleSecret);
      expect(actual).toBe('SECRET="new-secret"\nKEEP=ok\n');
    });

    it('Should_ReplaceEveryOccurrence_When_DuplicatesUseDifferentForms', async () => {
      // Arrange: rewriting only the duplicate dotenv happens to read would let
      // every value check pass while the other one kept the old secret.
      const staleSecret = 'old-secret';
      mockInMemoryFiles.set(
        mockEnvFilePath,
        `SECRET:\n  ${staleSecret}\nSECRET=placeholder\nKEEP=ok\n`,
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { SECRET: 'new-secret' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(staleSecret);
      expect(actual).not.toContain('placeholder');
      expect(actual).toBe(
        'SECRET:\n  new-secret\nSECRET=new-secret\nKEEP=ok\n',
      );
    });

    it('Should_KeepTheFinalLineEnding_When_ACrlfOnlyAppearsInsideAValue', async () => {
      // Arrange: the file is structurally LF; its only CRLF is payload inside
      // an unmanaged multiline secret, so it must not dictate the terminator.
      mockInMemoryFiles.set(mockEnvFilePath, "KEEP='a\r\nb'\nTOKEN=old\n");

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        TOKEN: 'new',
        ADDED: 'extra',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe("KEEP='a\r\nb'\nTOKEN=new\nADDED=extra\n");
      expect(dotenv.parse(actual)).toEqual({
        KEEP: 'a\nb',
        TOKEN: 'new',
        ADDED: 'extra',
      });
    });

    it('Should_NotSurfaceAHiddenKey_When_ItIsPayloadOfTheManagedValue', async () => {
      // Arrange: HIDDEN is not an assignment, it is text inside MANAGED's
      // value. Replacing that value must take it away, never promote it to a
      // key of its own.
      const hiddenText = 'leaked';
      mockInMemoryFiles.set(
        mockEnvFilePath,
        `MANAGED=\n"orphan\nHIDDEN=${hiddenText}"\nOTHER=1\n`,
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        MANAGED: 'updated-value',
        OTHER: '1',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).not.toContain(hiddenText);
      expect(actual).not.toContain('HIDDEN');
      expect(dotenv.parse(actual)).toEqual({
        MANAGED: 'updated-value',
        OTHER: '1',
      });
    });

    it('Should_LeaveUntouchedAssignmentsByteForByte_When_EveryKeyIsHandedBack', async () => {
      // Arrange: the CLI hands back every key it read, not just the mapped
      // ones, so an assignment that already holds its value must not be
      // reserialized out of the form the file gave it.
      const existing =
        '# note\nKEEP=\'a\r\nb\'\nMULTI="one\ntwo"\nLITERAL=first\\nsecond\nTOKEN=old\n';
      mockInMemoryFiles.set(mockEnvFilePath, existing);
      const handedBack = { ...dotenv.parse(existing), TOKEN: 'new' };

      // Act
      await sut.saveEnvironment(mockEnvFilePath, handedBack);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe(existing.replace('TOKEN=old', 'TOKEN=new'));
    });

    it('Should_KeepTheBlanksBeforeAnInlineComment_When_UpdatingAnUnquotedAssignment', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, 'KEY=old \t # note\nZ=1\n');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { KEY: 'new' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe('KEY=new \t # note\nZ=1\n');
    });

    it('Should_UseTheStructuralLineEnding_When_ACommentFollowsAMultilineValue', async () => {
      // Arrange: the break before the comment is the only structural one, so
      // the comment has to stay outside the value's span for it to be seen.
      mockInMemoryFiles.set(mockEnvFilePath, "KEEP='a\r\nb'\n# note");

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { TOKEN: 'x' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe("KEEP='a\r\nb'\n# note\nTOKEN=x");
    });

    it('Should_UseTheStructuralLineEnding_When_ABlankLinePrecedesTheOnlyAssignment', async () => {
      // Arrange: the leading blank line is the only structural break, and the
      // assignment's prefix reaches back over it.
      mockInMemoryFiles.set(mockEnvFilePath, "\nKEEP='a\r\nb'");

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { NEW: 'x' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe("\nKEEP='a\r\nb'\nNEW=x");
    });

    it('Should_AppendWithCrlf_When_ACrlfFileHasNoFinalNewline', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, 'A=1\r\nB=2');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { NEW: 'x' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe('A=1\r\nB=2\r\nNEW=x');
    });

    it('Should_UseTheStructuralLineEnding_When_AppendingToAFileWithoutAFinalNewline', async () => {
      // Arrange: the file's structure is LF; its only CRLF is payload inside an
      // unmanaged multiline secret, and there is no final newline to fall back
      // on, so the separator has to come from a break between assignments.
      mockInMemoryFiles.set(mockEnvFilePath, "KEEP='a\r\nb'\nTOKEN=old");

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        TOKEN: 'new',
        ADDED: 'extra',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath) as string;
      expect(actual).toBe("KEEP='a\r\nb'\nTOKEN=new\nADDED=extra");
    });

    it('Should_ThrowError_When_FailsToWriteEnvFile', async () => {
      // Arrange
      const errorMessage = 'Permission denied';
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error(errorMessage));

      // Act
      const action = () =>
        sut.saveEnvironment(mockEnvFilePath, { TEST: 'value' });

      // Assert
      await expect(action()).rejects.toThrow(
        `Failed to write environment file: ${errorMessage}`,
      );
    });

    it('Should_HandleNonErrorObject_When_WriteFileFails', async () => {
      // Arrange
      vi.mocked(fs.writeFile).mockRejectedValueOnce('String error');

      // Act
      const action = () =>
        sut.saveEnvironment(mockEnvFilePath, { TEST: 'value' });

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to write environment file: String error',
      );
    });

    it('Should_PreserveCommentsAndOrder_When_UpdatingExistingEnvFile', async () => {
      // Arrange
      const existing = [
        '# Database configuration',
        'DB_HOST=old-host',
        '',
        '# Auth section',
        'API_KEY=old-key',
      ].join('\n');
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        DB_HOST: 'new-host',
        API_KEY: 'new-key',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(
        [
          '# Database configuration',
          'DB_HOST=new-host',
          '',
          '# Auth section',
          'API_KEY=new-key',
        ].join('\n'),
      );
    });

    it('Should_PreserveKeySpacing_When_UpdatingExistingEnvFile', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, 'export DB_HOST = old-host');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { DB_HOST: 'new-host' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe('export DB_HOST = new-host');
    });

    it('Should_AppendNewKeys_When_KeysNotInExistingEnvFile', async () => {
      // Arrange
      mockInMemoryFiles.set(
        mockEnvFilePath,
        ['# Existing', 'DB_HOST=old-host'].join('\n'),
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        DB_HOST: 'new-host',
        NEW_VAR: 'new-value',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(
        ['# Existing', 'DB_HOST=new-host', 'NEW_VAR=new-value'].join('\n'),
      );
    });

    it('Should_PreserveTrailingNewline_When_AppendingNewKeys', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, 'DB_HOST=old-host\n');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        DB_HOST: 'new-host',
        NEW_VAR: 'new-value',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe('DB_HOST=new-host\nNEW_VAR=new-value\n');
    });

    it('Should_PreserveCRLFLineEndings_When_UpdatingExistingEnvFile', async () => {
      // Arrange
      const existing = [
        '# Database configuration',
        'DB_HOST=old-host',
        '',
        '# Auth section',
        'API_KEY=old-key',
      ].join('\r\n');
      mockInMemoryFiles.set(mockEnvFilePath, existing);

      // Act
      await sut.saveEnvironment(mockEnvFilePath, {
        DB_HOST: 'new-host',
        API_KEY: 'new-key',
      });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(
        [
          '# Database configuration',
          'DB_HOST=new-host',
          '',
          '# Auth section',
          'API_KEY=new-key',
        ].join('\r\n'),
      );
    });

    it('Should_UpdateAllOccurrences_When_DuplicateKeysExist', async () => {
      // Arrange
      mockInMemoryFiles.set(
        mockEnvFilePath,
        ['DB_HOST=old1', 'DB_HOST=old2'].join('\n'),
      );

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { DB_HOST: 'new-host' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(['DB_HOST=new-host', 'DB_HOST=new-host'].join('\n'));
    });

    it('Should_PreserveDoubleQuotes_When_UpdatingQuotedValue', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, 'DB_HOST="old-host"');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { DB_HOST: 'new-host' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe('DB_HOST="new-host"');
    });

    it('Should_PreserveSingleQuotes_When_UpdatingQuotedValue', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, "DB_HOST='old-host'");

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { DB_HOST: 'new-host' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe("DB_HOST='new-host'");
    });

    it('Should_FallBackToUnquoted_When_NewValueContainsTheQuoteCharacter', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, 'DB_HOST="old-host"');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { DB_HOST: 'has"quote' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe('DB_HOST=has"quote');
    });

    it('Should_NotAddLeadingBlankLine_When_ExistingFileIsEmpty', async () => {
      // Arrange
      mockInMemoryFiles.set(mockEnvFilePath, '');

      // Act
      await sut.saveEnvironment(mockEnvFilePath, { NEW_VAR: 'new-value' });

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe('NEW_VAR=new-value\n');
    });

    it('Should_ThrowError_When_ReadingExistingEnvFileFailsWithNonEnoent', async () => {
      // Arrange
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      vi.mocked(fs.readFile).mockRejectedValueOnce(error);

      // Act
      const action = () =>
        sut.saveEnvironment(mockEnvFilePath, { TEST: 'value' });

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to read environment file: Permission denied',
      );
    });
  });

  describe('loadMapFile', () => {
    it('Should_LoadParamMap_When_FileIsValid', async () => {
      // Arrange
      const expected = {
        TEST_VAR1: '/test/backslash',
        TEST_VAR2: '/test/newlines',
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(expected));

      // Act
      const paramMap = await sut.getMapping(mockMapPath);

      // Assert
      expect(paramMap).toEqual(expected);
    });

    it('Should_ThrowError_When_MapFileContainsInvalidJSON', async () => {
      // Arrange
      mockInMemoryFiles.set(invalidJsonPath, 'invalid-json');

      // Act
      const action = () => sut.getMapping(invalidJsonPath);

      // Assert
      await expect(action()).rejects.toThrow(
        'Invalid JSON in parameter map file: ./tests/invalid-map.json',
      );
    });

    it('Should_ThrowError_When_MapFileDoesNotExist', async () => {
      // Arrange
      const nonExistentPath = './tests/non-existent-map.json';

      // Act
      const action = () => sut.getMapping(nonExistentPath);

      // Assert
      await expect(action()).rejects.toThrow(
        `Failed to read map file: ${nonExistentPath}`,
      );
    });

    it('Should_HandleNonErrorObject_When_ReadFileFails', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.getMapping(mockMapPath);

      // Assert
      await expect(action()).rejects.toThrow(
        `Failed to read map file: ${mockMapPath}`,
      );
    });
  });

  describe('loadEnvFile', () => {
    it('Should_LoadExistingEnvFile_When_FileExists', async () => {
      // Arrange
      const expectedVars = {
        TEST_VAR1: 'value1',
        TEST_VAR2: 'value2',
      };
      const envContent = Object.entries(expectedVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      mockInMemoryFiles.set(mockEnvFilePath, envContent);

      // Act
      const result = await sut.getEnvironment(mockEnvFilePath);

      // Assert
      expect(result).toEqual(expectedVars);
    });

    it('Should_ReturnEmptyObject_When_EnvFileDoesNotExist', async () => {
      // Arrange
      const nonExistentPath = './tests/non-existent.env';

      // Act
      const result = await sut.getEnvironment(nonExistentPath);

      // Assert
      expect(result).toEqual({});
    });

    it('Should_ThrowError_When_ReadFileErrors', async () => {
      // Arrange
      vi.mocked(fs.access).mockResolvedValueOnce();
      const errorMessage = 'Read permission denied';
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error(errorMessage));

      // Act
      const action = () => sut.getEnvironment(mockEnvFilePath);

      // Assert
      await expect(action()).rejects.toThrow();
    });

    it('Should_HandleNonErrorObject_When_ReadFileFails', async () => {
      // Arrange
      vi.mocked(fs.access).mockResolvedValueOnce();
      vi.mocked(fs.readFile).mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.getEnvironment(mockEnvFilePath);

      // Assert
      await expect(action()).rejects.toThrow();
    });
  });

  describe('getParsedMapping', () => {
    it('Should_ReturnEmptyConfig_When_MapFileHasNoConfigSection', async () => {
      // Arrange
      const mapData = {
        DB_URL: '/app/db',
        API_KEY: '/app/key',
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await sut.getParsedMapping(mockMapPath);

      // Assert
      expect(result.config).toEqual({});
      expect(result.mappings).toEqual(mapData);
    });

    it('Should_ExtractConfig_When_MapFileHasConfigSection', async () => {
      // Arrange
      const mapData = {
        $config: {
          provider: 'azure',
          vaultUrl: 'https://my-vault.vault.azure.net',
        },
        DB_URL: 'myapp-db-url',
        API_KEY: 'myapp-api-key',
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await sut.getParsedMapping(mockMapPath);

      // Assert
      expect(result.config).toEqual({
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
      });
    });

    it('Should_ExcludeConfigFromMappings_When_ConfigSectionPresent', async () => {
      // Arrange
      const mapData = {
        $config: {
          provider: 'azure',
          vaultUrl: 'https://my-vault.vault.azure.net',
        },
        DB_URL: 'myapp-db-url',
        API_KEY: 'myapp-api-key',
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await sut.getParsedMapping(mockMapPath);

      // Assert
      expect(result.mappings).toEqual({
        DB_URL: 'myapp-db-url',
        API_KEY: 'myapp-api-key',
      });
      expect(result.mappings).not.toHaveProperty('$config');
    });

    it('Should_ExcludeDollarPrefixedKeys_When_MapFileContainsSchemaKey', async () => {
      // Arrange
      const mapData = {
        $schema: 'https://envilder.com/schema/map-file.v1.json',
        $config: { provider: 'aws' },
        DB_URL: '/app/db',
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await sut.getParsedMapping(mockMapPath);

      // Assert
      expect(result.config).toEqual({ provider: 'aws' });
      expect(result.mappings).toEqual({ DB_URL: '/app/db' });
      expect(result.mappings).not.toHaveProperty('$schema');
    });

    it('Should_ExcludeNonStringValues_When_MapFileContainsNumericOrObjectValues', async () => {
      // Arrange
      const mapData = {
        DB_URL: '/app/db',
        INVALID_NUMBER: 42,
        INVALID_OBJECT: { nested: true },
        API_KEY: '/app/key',
        INVALID_BOOL: true,
        INVALID_NULL: null,
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await sut.getParsedMapping(mockMapPath);

      // Assert
      expect(result.mappings).toEqual({
        DB_URL: '/app/db',
        API_KEY: '/app/key',
      });
    });
  });

  describe('getMapping with $config', () => {
    it('Should_StripConfigFromGetMapping_When_ConfigSectionPresent', async () => {
      // Arrange
      const mapData = {
        $config: { provider: 'azure' },
        DB_URL: 'myapp-db-url',
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await sut.getMapping(mockMapPath);

      // Assert
      expect(result).toEqual({ DB_URL: 'myapp-db-url' });
      expect(result).not.toHaveProperty('$config');
    });
  });

  describe('readMapFileConfig', () => {
    it('Should_ReturnEmptyConfig_When_FileHasNoConfigSection', async () => {
      // Arrange
      const mapData = { DB_URL: '/app/db' };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await readMapFileConfig(mockMapPath);

      // Assert
      expect(result).toEqual({});
    });

    it('Should_ReturnConfig_When_FileHasConfigSection', async () => {
      // Arrange
      const mapData = {
        $config: {
          provider: 'azure',
          vaultUrl: 'https://my-vault.vault.azure.net',
        },
        DB_URL: 'myapp-db-url',
      };
      mockInMemoryFiles.set(mockMapPath, JSON.stringify(mapData));

      // Act
      const result = await readMapFileConfig(mockMapPath);

      // Assert
      expect(result).toEqual({
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
      });
    });

    it('Should_ThrowError_When_FileDoesNotExist', async () => {
      // Arrange
      const nonExistentPath = './tests/non-existent-config.json';

      // Act
      const action = () => readMapFileConfig(nonExistentPath);

      // Assert
      await expect(action()).rejects.toThrow(
        `Failed to read map file: ${nonExistentPath}`,
      );
    });

    it('Should_ThrowInvalidJsonError_When_FileContainsMalformedJson', async () => {
      // Arrange
      mockInMemoryFiles.set(mockMapPath, 'not valid json {{{');

      // Act
      const action = () => readMapFileConfig(mockMapPath);

      // Assert
      await expect(action()).rejects.toThrow(
        `Invalid JSON in parameter map file: ${mockMapPath}`,
      );
    });
  });
});
