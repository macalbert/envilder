import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvFileManager } from '../../../../src/envilder/infrastructure/EnvManager/EnvFileManager';
import { ConsoleLogger } from '../../../../src/envilder/infrastructure/Logger/ConsoleLogger';

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
      return Promise.reject(
        new Error(`ENOENT: no such file or directory, open '${path}'`),
      );
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

describe('EnvFileManager', () => {
  let sut: EnvFileManager;

  const mockMapPath = './tests/escaping-map.json';
  const mockEnvFilePath = './tests/.env.escaping.test';
  const invalidJsonPath = './tests/invalid-map.json';

  beforeEach(() => {
    sut = new EnvFileManager(new ConsoleLogger());
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
        new EnvFileManager(undefined as unknown as ConsoleLogger);

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
      await sut.saveEnvFile(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`BACKSLASH_VAR=${escapeForEnvFile(expected)}`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.BACKSLASH_VAR).toBe(expected);
    });

    it('Should_EscapeNewlines_When_WritingEnvFile', async () => {
      // Arrange
      const expected = 'value\\nwith\\nnewlines';
      const envVars = { NEWLINE_VAR: expected };

      // Act
      await sut.saveEnvFile(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`NEWLINE_VAR=${escapeForEnvFile(expected)}`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.NEWLINE_VAR).toBe(expected);
    });

    it('Should_EscapeQuotes_When_WritingEnvFile', async () => {
      // Arrange
      const expected = 'value"with"quotes';
      const envVars = { QUOTE_VAR: expected };

      // Act
      await sut.saveEnvFile(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`QUOTE_VAR=${escapeForEnvFile(expected)}`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.QUOTE_VAR).toBe(expected);
    });

    it('Should_HandleCombinationOfSpecialCharacters_When_WritingEnvFile', async () => {
      // Arrange
      const expected = 'value"with"\\neverything\\combined';
      const envVars = { COMBINED_VAR: expected };

      // Act
      await sut.saveEnvFile(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`COMBINED_VAR=${escapeForEnvFile(expected)}`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.COMBINED_VAR).toBe(expected);
    });

    it('Should_HandleAlreadyEscapedStrings_When_WritingEnvFile', async () => {
      // Arrange
      const input = 'value\\already\\escaped';
      const envVars = { ESCAPED_VAR: input };

      // Act
      await sut.saveEnvFile(mockEnvFilePath, envVars);

      // Assert
      const actual = mockInMemoryFiles.get(mockEnvFilePath);
      expect(actual).toBe(`ESCAPED_VAR=${escapeForEnvFile(input)}`);
      const parsed = dotenv.parse(actual as string);
      expect(parsed.ESCAPED_VAR).toBe(input);
    });

    it('Should_ThrowError_When_FailsToWriteEnvFile', async () => {
      // Arrange
      const errorMessage = 'Permission denied';
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error(errorMessage));

      // Act
      const action = () => sut.saveEnvFile(mockEnvFilePath, { TEST: 'value' });

      // Assert
      await expect(action()).rejects.toThrow(
        `Failed to write environment file: ${errorMessage}`,
      );
    });

    it('Should_HandleNonErrorObject_When_WriteFileFails', async () => {
      // Arrange
      vi.mocked(fs.writeFile).mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.saveEnvFile(mockEnvFilePath, { TEST: 'value' });

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to write environment file: String error',
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
      const paramMap = await sut.loadMapFile(mockMapPath);

      // Assert
      expect(paramMap).toEqual(expected);
    });

    it('Should_ThrowError_When_MapFileContainsInvalidJSON', async () => {
      // Arrange
      mockInMemoryFiles.set(invalidJsonPath, 'invalid-json');

      // Act
      const action = () => sut.loadMapFile(invalidJsonPath);

      // Assert
      await expect(action()).rejects.toThrow(
        'Invalid JSON in parameter map file: ./tests/invalid-map.json',
      );
    });

    it('Should_ThrowError_When_MapFileDoesNotExist', async () => {
      // Arrange
      const nonExistentPath = './tests/non-existent-map.json';

      // Act
      const action = () => sut.loadMapFile(nonExistentPath);

      // Assert
      await expect(action()).rejects.toThrow(
        `Failed to read map file: ${nonExistentPath}`,
      );
    });

    it('Should_HandleNonErrorObject_When_ReadFileFails', async () => {
      // Arrange
      vi.mocked(fs.readFile).mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.loadMapFile(mockMapPath);

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
      const result = await sut.loadEnvFile(mockEnvFilePath);

      // Assert
      expect(result).toEqual(expectedVars);
    });

    it('Should_ReturnEmptyObject_When_EnvFileDoesNotExist', async () => {
      // Arrange
      const nonExistentPath = './tests/non-existent.env';

      // Act
      const result = await sut.loadEnvFile(nonExistentPath);

      // Assert
      expect(result).toEqual({});
    });

    it('Should_ThrowError_When_ReadFileErrors', async () => {
      // Arrange
      vi.mocked(fs.access).mockResolvedValueOnce();
      const errorMessage = 'Read permission denied';
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error(errorMessage));

      // Act
      const action = () => sut.loadEnvFile(mockEnvFilePath);

      // Assert
      await expect(action()).rejects.toThrow();
    });

    it('Should_HandleNonErrorObject_When_ReadFileFails', async () => {
      // Arrange
      vi.mocked(fs.access).mockResolvedValueOnce();
      vi.mocked(fs.readFile).mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.loadEnvFile(mockEnvFilePath);

      // Assert
      await expect(action()).rejects.toBeTruthy();
    });
  });
});
