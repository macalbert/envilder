import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnvFileManager } from '../../../src/cli/infrastructure/EnvFileManager';
import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';

describe('EnvFileManager', () => {
  const sut = new EnvFileManager();

  const mockMapPath = './tests/escaping-map.json';
  const mockEnvFilePath = './tests/.env.escaping.test';

  afterEach(async () => {
    vi.clearAllMocks();
    try {
      await fs.unlink(mockEnvFilePath);
    } catch {}
    try {
      await fs.unlink(mockMapPath);
    } catch {}
  });

  function escapeForEnvFile(value: string): string {
    return value.replace(/(\r\n|\n|\r)/g, '\\n');
  }

  it('Should_EscapeBackslashes_When_WritingEnvFile', async () => {
    // Arrange
    const expected = 'value\\with\\backslashes';
    const envVars = { BACKSLASH_VAR: expected };

    // Act
    await sut.saveEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = await fs.readFile(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`BACKSLASH_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.BACKSLASH_VAR).toBe(expected);
  });

  it('Should_EscapeNewlines_When_WritingEnvFile', async () => {
    // Arrange
    const expected = 'value\\nwith\\nnewlines';
    const envVars = { NEWLINE_VAR: expected };

    // Act
    await sut.saveEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = await fs.readFile(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`NEWLINE_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.NEWLINE_VAR).toBe(expected);
  });

  it('Should_EscapeQuotes_When_WritingEnvFile', async () => {
    // Arrange
    const expected = 'value"with"quotes';
    const envVars = { QUOTE_VAR: expected };

    // Act
    await sut.saveEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = await fs.readFile(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`QUOTE_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.QUOTE_VAR).toBe(expected);
  });

  it('Should_HandleCombinationOfSpecialCharacters_When_WritingEnvFile', async () => {
    // Arrange
    const expected = 'value"with"\\neverything\\combined'; // literal backslash-n and double backslash
    const envVars = { COMBINED_VAR: expected };

    // Act
    await sut.saveEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = await fs.readFile(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`COMBINED_VAR=${escapeForEnvFile(expected)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.COMBINED_VAR).toBe(expected);
  });

  it('Should_HandleAlreadyEscapedStrings_When_WritingEnvFile', async () => {
    // Arrange
    const input = 'value\\already\\escaped';
    const envVars = { ESCAPED_VAR: input };

    // Act
    await sut.saveEnvFile(mockEnvFilePath, envVars);

    // Assert
    const actual = await fs.readFile(mockEnvFilePath, 'utf-8');
    expect(actual).toBe(`ESCAPED_VAR=${escapeForEnvFile(input)}`);
    const parsed = dotenv.parse(actual);
    expect(parsed.ESCAPED_VAR).toBe(input);
  });

  it('Should_LoadParamMap_When_FileIsValid', async () => {
    // Arrange
    const expected = {
      TEST_VAR1: '/test/backslash',
      TEST_VAR2: '/test/newlines',
    };
    await fs.writeFile(mockMapPath, JSON.stringify(expected));

    // Act
    const paramMap = await sut.loadMapFile(mockMapPath);

    // Assert
    expect(paramMap).toEqual(expected);
  });
});
