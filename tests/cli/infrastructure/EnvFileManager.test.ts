import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnvFileManager } from '../../../src/cli/infrastructure/EnvFileManager';

describe('String Escaping in Environment File Generation', () => {
  const sut = new EnvFileManager();

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

  function escapeForEnvFile(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/"/g, '\\"');
  }

  it('Should_EscapeBackslashes_When_WritingEnvFile', () => {
    // Arrange
    const expected = 'value\\with\\backslashes';
    const envVars = { BACKSLASH_VAR: expected };

    // Act
    sut.writeEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`BACKSLASH_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.BACKSLASH_VAR).toBe(escapeForEnvFile(expected));
  });

  it('Should_EscapeNewlines_When_WritingEnvFile', () => {
    // Arrange
    const expected = 'value\nwith\nnewlines';
    const envVars = { NEWLINE_VAR: expected };

    // Act
    sut.writeEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`NEWLINE_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.NEWLINE_VAR).toBe(escapeForEnvFile(expected));
  });

  it('Should_EscapeQuotes_When_WritingEnvFile', () => {
    // Arrange
    const expected = 'value"with"quotes';
    const envVars = { QUOTE_VAR: expected };

    // Act
    sut.writeEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`QUOTE_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.QUOTE_VAR).toBe(escapeForEnvFile(expected));
  });

  it('Should_HandleCombinationOfSpecialCharacters_When_WritingEnvFile', () => {
    // Arrange
    const expected = 'value"with"\neverything\\combined';
    const envVars = { COMBINED_VAR: expected };

    // Act
    sut.writeEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`COMBINED_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.COMBINED_VAR).toBe(escapeForEnvFile(expected));
  });

  it('Should_HandleAlreadyEscapedStrings_When_WritingEnvFile', () => {
    // Arrange
    const input = 'value\\already\\escaped';
    const envVars = { ESCAPED_VAR: input };

    // Act
    sut.writeEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = fs.readFileSync(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`ESCAPED_VAR=${escapeForEnvFile(input)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.ESCAPED_VAR).toBe(escapeForEnvFile(input));
  });

  it('Should_LoadParamMap_When_FileIsValid', () => {
    // Arrange
    const expected = {
      TEST_VAR1: '/test/backslash',
      TEST_VAR2: '/test/newlines',
    };
    fs.writeFileSync(mockMapPath, JSON.stringify(expected));

    // Act
    const paramMap = sut.loadParamMap(mockMapPath);

    // Assert
    expect(paramMap).toEqual(expected);
  });
});
