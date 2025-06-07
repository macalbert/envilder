import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnvilderBuilder } from '../../../src/cli/domain/EnvilderBuilder';

// Mock the SSM client
vi.mock('@aws-sdk/client-ssm', () => {
  return {
    SSM: vi.fn().mockImplementation(() => ({
      send: vi.fn((command) => {
        const testValues: Record<string, string> = {
          '/test/backslash': 'value\\with\\backslashes',
          '/test/newlines': 'value\nwith\nnewlines',
          '/test/quotes': 'value"with"quotes',
          '/test/combined': 'value\\"with\\"\neverything\\combined',
          '/test/already-escaped': 'value\\\\already\\\\escaped',
        };

        const paramName = command.input.Name;
        if (testValues[paramName]) {
          return Promise.resolve({
            Parameter: { Value: testValues[paramName] },
          });
        }

        return Promise.reject(new Error(`ParameterNotFound: ${paramName}`));
      }),
    })),
    GetParameterCommand: vi.fn().mockImplementation((input) => ({
      input,
    })),
  };
});

describe('String Escaping in Environment File Generation', () => {
  const mockMapPath = './tests/escaping-map.json';
  const mockEnvFilePath = './tests/.env.escaping.test';

  afterEach(() => {
    vi.clearAllMocks();

    if (fs.existsSync(mockEnvFilePath)) {
      fs.unlinkSync(mockEnvFilePath);
    }

    if (fs.existsSync(mockMapPath)) {
      fs.unlinkSync(mockMapPath);
    }
  });

  it('Should_EscapeBackslashes_When_WritingEnvFile', async () => {
    // Arrange
    const paramMapContent = {
      BACKSLASH_VAR: '/test/backslash',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));
    const sut = EnvilderBuilder.build().withAwsProvider().create();

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe('BACKSLASH_VAR=value\\\\with\\\\backslashes');
    const parsed = dotenv.parse(actual);
    expect(parsed.BACKSLASH_VAR).toBe('value\\\\with\\\\backslashes');
  });

  it('Should_EscapeNewlines_When_WritingEnvFile', async () => {
    // Arrange
    const paramMapContent = {
      NEWLINE_VAR: '/test/newlines',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));
    const sut = EnvilderBuilder.build().withAwsProvider().create();

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe('NEWLINE_VAR=value\\nwith\\nnewlines');
    const parsed = dotenv.parse(actual);
    expect(parsed.NEWLINE_VAR).toBe('value\\nwith\\nnewlines');
  });

  it('Should_EscapeQuotes_When_WritingEnvFile', async () => {
    // Arrange
    const paramMapContent = {
      QUOTE_VAR: '/test/quotes',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));
    const sut = EnvilderBuilder.build().withAwsProvider().create();

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe('QUOTE_VAR=value\\"with\\"quotes');
    const parsed = dotenv.parse(actual);
    expect(parsed.QUOTE_VAR).toBe('value\\"with\\"quotes');
  });

  it('Should_HandleCombinationOfSpecialCharacters_When_WritingEnvFile', async () => {
    // Arrange
    const paramMapContent = {
      COMBINED_VAR: '/test/combined',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));
    const sut = EnvilderBuilder.build().withAwsProvider().create();

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    const hasEscapedBackslashQuote = actual.includes('\\"');
    const hasEscapedNewline = actual.includes('\\n');
    const hasEscapedBackslashCombined = actual.includes('\\combined');
    expect(hasEscapedBackslashQuote).toBe(true);
    expect(hasEscapedNewline).toBe(true);
    expect(hasEscapedBackslashCombined).toBe(true);

    const parsed = dotenv.parse(actual);
    const containsEscapedQuote = parsed.COMBINED_VAR.includes('"');
    expect(containsEscapedQuote).toBe(true);
  });

  it('Should_HandleAlreadyEscapedStrings_When_WritingEnvFile', async () => {
    // Arrange
    const paramMapContent = {
      ESCAPED_VAR: '/test/already-escaped',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(paramMapContent));
    const sut = EnvilderBuilder.build().withAwsProvider().create();

    // Act
    await sut.run(mockMapPath, mockEnvFilePath);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    const hasDoubleEscapedBackslash = actual.includes('\\\\');
    expect(hasDoubleEscapedBackslash).toBe(true);

    const parsed = dotenv.parse(actual);
    const containsEscapedBackslash = parsed.ESCAPED_VAR.includes('\\');
    expect(containsEscapedBackslash).toBe(true);
  });
});
