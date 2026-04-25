import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Envilder } from '../../../../src/sdks/typescript/src/application/envilder.js';
import { SecretProviderType } from '../../../../src/sdks/typescript/src/domain/secret-provider-type.js';

// Mock fs/promises for file reading
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

// Mock the factory
vi.mock(
  '../../../../src/sdks/typescript/src/infrastructure/secret-provider-factory.js',
  () => ({
    createSecretProvider: vi.fn(),
  }),
);

import { readFile } from 'node:fs/promises';
import { createSecretProvider } from '../../../../src/sdks/typescript/src/infrastructure/secret-provider-factory.js';

const mockReadFile = vi.mocked(readFile);
const mockCreateProvider = vi.mocked(createSecretProvider);

const SAMPLE_MAP_JSON = JSON.stringify({
  DB_URL: '/app/db-url',
  API_KEY: '/app/api-key',
});

const mockProvider = {
  getSecret: vi.fn(async (name: string) => {
    const secrets: Record<string, string> = {
      '/app/db-url': 'postgres://localhost',
      '/app/api-key': 'sk-123',
    };
    return secrets[name] ?? null;
  }),
};

describe('Envilder', () => {
  beforeEach(() => {
    mockReadFile.mockResolvedValue(SAMPLE_MAP_JSON);
    mockCreateProvider.mockReturnValue(mockProvider);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    delete process.env.DB_URL;
    delete process.env.API_KEY;
  });

  describe('load', () => {
    it('Should_ResolveAndInject_When_LoadCalled', async () => {
      // Act
      const actual = await Envilder.load('secrets-map.json');

      // Assert
      expect(actual.get('DB_URL')).toBe('postgres://localhost');
      expect(actual.get('API_KEY')).toBe('sk-123');
      expect(process.env.DB_URL).toBe('postgres://localhost');
      expect(process.env.API_KEY).toBe('sk-123');
    });

    it('Should_ThrowError_When_FilePathIsEmpty', async () => {
      // Act & Assert
      await expect(Envilder.load('')).rejects.toThrow(
        'file path cannot be empty',
      );
    });

    it('Should_ThrowError_When_FilePathIsWhitespace', async () => {
      // Act & Assert
      await expect(Envilder.load('   ')).rejects.toThrow(
        'file path cannot be empty',
      );
    });
  });

  describe('resolveFile', () => {
    it('Should_ResolveWithoutInjecting_When_ResolveFileCalled', async () => {
      // Act
      const actual = await Envilder.resolveFile('secrets-map.json');

      // Assert
      expect(actual.get('DB_URL')).toBe('postgres://localhost');
      expect(actual.get('API_KEY')).toBe('sk-123');
      expect(process.env.DB_URL).toBeUndefined();
      expect(process.env.API_KEY).toBeUndefined();
    });
  });

  describe('environment routing', () => {
    it('Should_LoadFromMappedFile_When_EnvMappingProvided', async () => {
      // Act
      const actual = await Envilder.load('production', {
        production: 'prod-secrets.json',
        test: null,
      });

      // Assert
      expect(mockReadFile).toHaveBeenCalledWith('prod-secrets.json', 'utf-8');
      expect(actual.size).toBe(2);
    });

    it('Should_ReturnEmpty_When_EnvMapsToNull', async () => {
      // Act
      const actual = await Envilder.load('test', {
        production: 'prod-secrets.json',
        test: null,
      });

      // Assert
      expect(actual.size).toBe(0);
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('Should_ReturnEmpty_When_EnvNotInMapping', async () => {
      // Act
      const actual = await Envilder.load('staging', {
        production: 'prod-secrets.json',
      });

      // Assert
      expect(actual.size).toBe(0);
    });

    it('Should_ThrowError_When_EnvIsEmpty', async () => {
      // Act & Assert
      await expect(
        Envilder.load('', { production: 'prod-secrets.json' }),
      ).rejects.toThrow('env cannot be empty');
    });

    it('Should_ThrowError_When_EnvMappingHasEmptyPath', async () => {
      // Act & Assert
      await expect(
        Envilder.load('production', { production: '   ' }),
      ).rejects.toThrow('empty file path');
    });
  });

  describe('fluent builder', () => {
    it('Should_ApplyOverrides_When_FluentBuilderUsed', async () => {
      // Act
      const actual = await Envilder.fromMapFile('secrets-map.json')
        .withProvider(SecretProviderType.Azure)
        .withVaultUrl('https://my-vault.vault.azure.net')
        .resolve();

      // Assert
      expect(mockCreateProvider).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          provider: SecretProviderType.Azure,
          vaultUrl: 'https://my-vault.vault.azure.net',
        }),
      );
      expect(actual.size).toBe(2);
    });

    it('Should_InjectSecrets_When_InjectCalled', async () => {
      // Act
      const actual = await Envilder.fromMapFile('secrets-map.json').inject();

      // Assert
      expect(actual.get('DB_URL')).toBe('postgres://localhost');
      expect(process.env.DB_URL).toBe('postgres://localhost');
    });

    it('Should_ApplyProfile_When_WithProfileCalled', async () => {
      // Act
      await Envilder.fromMapFile('secrets-map.json')
        .withProfile('staging')
        .resolve();

      // Assert
      expect(mockCreateProvider).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ profile: 'staging' }),
      );
    });

    it('Should_ThrowError_When_FromMapFilePathIsEmpty', () => {
      // Act & Assert
      expect(() => Envilder.fromMapFile('')).toThrow(
        'file path cannot be empty',
      );
    });
  });
});
