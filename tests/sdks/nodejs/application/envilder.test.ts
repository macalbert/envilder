import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractValidationError } from '../../../../src/sdks/nodejs/src/application/contract-validation.js';
import { Envilder } from '../../../../src/sdks/nodejs/src/application/envilder.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';
import type {
  ISecretExistenceChecker,
  ISecretProvider,
} from '../../../../src/sdks/nodejs/src/index.js';

// Mock fs/promises for file reading
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

// Mock the factory
vi.mock(
  '../../../../src/sdks/nodejs/src/infrastructure/secret-provider-factory.js',
  () => ({
    createSecretProvider: vi.fn(),
  }),
);

import { readFile } from 'node:fs/promises';
import { createSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/secret-provider-factory.js';

const mockReadFile = vi.mocked(readFile);
const mockCreateProvider = vi.mocked(createSecretProvider);

const SAMPLE_MAP_JSON = JSON.stringify({
  DB_URL: '/app/db-url',
  API_KEY: '/app/api-key',
});

const mockProvider = {
  getSecrets: vi.fn(async (names: string[]) => {
    const secrets: Record<string, string> = {
      '/app/db-url': 'postgres://localhost',
      '/app/api-key': 'sk-123',
    };
    const result = new Map<string, string>();
    for (const name of names) {
      if (secrets[name]) {
        result.set(name, secrets[name]);
      }
    }
    return result;
  }),
  checkSecretsExist: vi.fn(async (names: readonly string[]) => {
    return new Map(names.map((name) => [name, { status: 'exists' as const }]));
  }),
};

describe('Envilder', () => {
  beforeEach(() => {
    mockReadFile.mockResolvedValue(SAMPLE_MAP_JSON);
    mockCreateProvider.mockReturnValue(mockProvider);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    delete process.env.DB_URL;
    delete process.env.API_KEY;
  });

  describe('load', () => {
    it('Should_ResolveAndInject_When_LoadCalled', async () => {
      // Act
      const actual = await Envilder.load('envilder.json');

      // Assert
      expect(actual.get('DB_URL')).toBe('postgres://localhost');
      expect(actual.get('API_KEY')).toBe('sk-123');
      expect(process.env.DB_URL).toBe('postgres://localhost');
      expect(process.env.API_KEY).toBe('sk-123');
    });

    it('Should_ThrowError_When_FilePathIsEmpty', async () => {
      // Act
      const act = Envilder.load('');

      // Assert
      await expect(act).rejects.toThrow('file path cannot be empty');
    });

    it('Should_ThrowError_When_FilePathIsWhitespace', async () => {
      // Act
      const act = Envilder.load('   ');

      // Assert
      await expect(act).rejects.toThrow('file path cannot be empty');
    });
  });

  describe('resolveFile', () => {
    it('Should_ResolveWithoutInjecting_When_ResolveFileCalled', async () => {
      // Act
      const actual = await Envilder.resolveFile('envilder.json');

      // Assert
      expect(actual.get('DB_URL')).toBe('postgres://localhost');
      expect(actual.get('API_KEY')).toBe('sk-123');
      expect(process.env.DB_URL).toBeUndefined();
      expect(process.env.API_KEY).toBeUndefined();
    });

    it('Should_ResolveFromMappedFile_When_EnvMappingProvided', async () => {
      // Act
      const actual = await Envilder.resolveFile('production', {
        production: 'prod-secrets.json',
        test: null,
      });

      // Assert
      expect(mockReadFile).toHaveBeenCalledWith('prod-secrets.json', 'utf-8');
      expect(actual.size).toBe(2);
      expect(process.env.DB_URL).toBeUndefined();
    });

    it('Should_ReturnEmpty_When_EnvMapsToNull', async () => {
      // Act
      const actual = await Envilder.resolveFile('test', {
        production: 'prod-secrets.json',
        test: null,
      });

      // Assert
      expect(actual.size).toBe(0);
      expect(mockReadFile).not.toHaveBeenCalled();
      expect(process.env.DB_URL).toBeUndefined();
    });

    it('Should_ReturnEmpty_When_EnvNotInMapping', async () => {
      // Act
      const actual = await Envilder.resolveFile('staging', {
        production: 'prod-secrets.json',
      });

      // Assert
      expect(actual.size).toBe(0);
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
      // Act
      const act = Envilder.load('', { production: 'prod-secrets.json' });

      // Assert
      await expect(act).rejects.toThrow('env cannot be empty');
    });

    it('Should_ThrowError_When_EnvMappingHasEmptyPath', async () => {
      // Act
      const act = Envilder.load('production', { production: '   ' });

      // Assert
      await expect(act).rejects.toThrow('empty file path');
    });
  });

  describe('fluent builder', () => {
    it('Should_ApplyOverrides_When_FluentBuilderUsed', async () => {
      // Act
      const actual = await Envilder.fromMapFile('envilder.json')
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
      const actual = await Envilder.fromMapFile('envilder.json').inject();

      // Assert
      expect(actual.get('DB_URL')).toBe('postgres://localhost');
      expect(process.env.DB_URL).toBe('postgres://localhost');
    });

    it('Should_ApplyProfile_When_WithProfileCalled', async () => {
      // Act
      await Envilder.fromMapFile('envilder.json')
        .withProfile('staging')
        .resolve();

      // Assert
      expect(mockCreateProvider).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ profile: 'staging' }),
      );
    });

    it('Should_ThrowError_When_FromMapFilePathIsEmpty', () => {
      // Act
      const act = () => Envilder.fromMapFile('');

      // Assert
      expect(act).toThrow('file path cannot be empty');
    });
  });

  describe('validateContract', () => {
    it('Should_ReportEveryKeyAsExisting_When_AllSecretsExist', async () => {
      // Act
      const actual =
        await Envilder.fromMapFile('envilder.json').validateContract();

      // Assert
      expect(actual).toEqual({
        isValid: true,
        mapFileErrors: [],
        keys: [
          {
            variable: 'DB_URL',
            path: '/app/db-url',
            provider: SecretProviderType.Aws,
            status: 'exists',
          },
          {
            variable: 'API_KEY',
            path: '/app/api-key',
            provider: SecretProviderType.Aws,
            status: 'exists',
          },
        ],
      });
      expect(mockProvider.getSecrets).not.toHaveBeenCalled();
    });

    it('Should_ReportMissingKeyWithoutThrowing_When_SecretDoesNotExist', async () => {
      // Arrange
      mockProvider.checkSecretsExist.mockResolvedValueOnce(
        new Map([
          ['/app/db-url', { status: 'exists' as const }],
          ['/app/api-key', { status: 'missing' as const }],
        ]),
      );

      // Act
      const actual =
        await Envilder.fromMapFile('envilder.json').validateContract();

      // Assert
      expect(actual.isValid).toBe(false);
      expect(actual.keys[1]).toEqual({
        variable: 'API_KEY',
        path: '/app/api-key',
        provider: SecretProviderType.Aws,
        status: 'missing',
      });
    });

    it('Should_ReportAccessDenied_When_IdentityCannotReadKey', async () => {
      // Arrange
      mockProvider.checkSecretsExist.mockResolvedValueOnce(
        new Map([
          ['/app/db-url', { status: 'access_denied' as const, reason: 'no' }],
          ['/app/api-key', { status: 'exists' as const }],
        ]),
      );

      // Act
      const actual =
        await Envilder.fromMapFile('envilder.json').validateContract();

      // Assert
      expect(actual.isValid).toBe(false);
      expect(actual.keys[0].status).toBe('access_denied');
    });

    it('Should_ReportProviderError_When_ProviderFails', async () => {
      // Arrange
      mockProvider.checkSecretsExist.mockResolvedValueOnce(
        new Map([
          ['/app/db-url', { status: 'provider_error' as const, reason: 'x' }],
          ['/app/api-key', { status: 'provider_error' as const, reason: 'x' }],
        ]),
      );

      // Act
      const actual =
        await Envilder.fromMapFile('envilder.json').validateContract();

      // Assert
      expect(actual.isValid).toBe(false);
      expect(actual.keys.map((key) => key.status)).toEqual([
        'provider_error',
        'provider_error',
      ]);
    });

    it('Should_ReportMapFileErrorsWithoutProviderCall_When_MapFileIsInvalid', async () => {
      // Arrange
      mockReadFile.mockResolvedValueOnce(
        JSON.stringify({ $config: { provider: 'azure' }, DB_URL: 42 }),
      );

      // Act
      const actual =
        await Envilder.fromMapFile('envilder.json').validateContract();

      // Assert
      expect(actual.isValid).toBe(false);
      expect(actual.keys).toEqual([]);
      expect(actual.mapFileErrors.map((error) => error.key)).toEqual([
        'DB_URL',
        '$config.vaultUrl',
      ]);
      expect(mockCreateProvider).not.toHaveBeenCalled();
    });

    it('Should_ReportEffectiveProvider_When_ProviderIsOverridden', async () => {
      // Arrange
      mockReadFile.mockResolvedValueOnce(JSON.stringify({ KEY: 'key' }));

      // Act
      const actual = await Envilder.fromMapFile('envilder.json')
        .withProvider(SecretProviderType.Azure)
        .withVaultUrl('https://kv.vault.azure.net')
        .validateContract();

      // Assert
      expect(actual.keys[0].provider).toBe(SecretProviderType.Azure);
    });

    it('Should_Throw_When_MapFileDoesNotExist', async () => {
      // Arrange
      mockReadFile.mockRejectedValueOnce(
        Object.assign(new Error('not found'), { code: 'ENOENT' }),
      );

      // Act
      const act = Envilder.fromMapFile('missing.json').validateContract();

      // Assert
      await expect(act).rejects.toThrow('Map file not found: missing.json');
    });
  });

  describe('withContractValidation', () => {
    it('Should_NotCheckContract_When_ContractValidationIsNotEnabled', async () => {
      // Act
      await Envilder.fromMapFile('envilder.json').resolve();

      // Assert
      expect(mockProvider.checkSecretsExist).not.toHaveBeenCalled();
    });

    it('Should_CheckOnceAndResolve_When_ContractHolds', async () => {
      // Act
      const actual = await Envilder.fromMapFile('envilder.json')
        .withContractValidation()
        .inject();

      // Assert
      expect(actual.get('DB_URL')).toBe('postgres://localhost');
      expect(process.env.API_KEY).toBe('sk-123');
      expect(mockProvider.checkSecretsExist).toHaveBeenCalledTimes(1);
      expect(mockCreateProvider).toHaveBeenCalledTimes(1);
    });

    it('Should_ThrowNamingKeysWithoutValues_When_KeyIsMissing', async () => {
      // Arrange
      mockProvider.checkSecretsExist.mockResolvedValueOnce(
        new Map([
          ['/app/db-url', { status: 'exists' as const }],
          ['/app/api-key', { status: 'missing' as const }],
        ]),
      );

      // Act
      const actual = await Envilder.fromMapFile('envilder.json')
        .withContractValidation()
        .inject()
        .catch((error: unknown) => error);

      // Assert
      expect(actual).toBeInstanceOf(ContractValidationError);
      const error = actual as ContractValidationError;
      expect(error.message).toBe(
        'Map file contract validation failed: API_KEY (/app/api-key): missing',
      );
      expect(error.message).not.toContain('postgres://localhost');
      expect(error.result.isValid).toBe(false);
      expect(mockProvider.getSecrets).not.toHaveBeenCalled();
      expect(process.env.DB_URL).toBeUndefined();
    });

    it('Should_ThrowWithoutProviderCall_When_MapFileIsInvalid', async () => {
      // Arrange
      mockReadFile.mockResolvedValueOnce(JSON.stringify({ $other: 'x' }));

      // Act
      const act = Envilder.fromMapFile('envilder.json')
        .withContractValidation()
        .resolve();

      // Assert
      await expect(act).rejects.toThrow(
        'Map file contract validation failed: $other: $other is reserved',
      );
      expect(mockCreateProvider).not.toHaveBeenCalled();
    });
  });
});

describe('Envilder with an injected secret provider', () => {
  const inMemorySecrets = new Map([
    ['/app/db-url', 'postgres://fake'],
    ['/app/api-key', 'sk-fake'],
  ]);

  function createFakeProvider(): ISecretProvider {
    return {
      getSecrets: vi.fn(async (names: string[]) => {
        const result = new Map<string, string>();
        for (const name of names) {
          const value = inMemorySecrets.get(name);
          if (value !== undefined) {
            result.set(name, value);
          }
        }
        return result;
      }),
    };
  }

  function createCheckableFakeProvider(): ISecretProvider &
    ISecretExistenceChecker {
    return {
      ...createFakeProvider(),
      checkSecretsExist: vi.fn(async (names: readonly string[]) => {
        return new Map(
          names.map((name) => [
            name,
            {
              status: inMemorySecrets.has(name)
                ? ('exists' as const)
                : ('missing' as const),
            },
          ]),
        );
      }),
    };
  }

  beforeEach(() => {
    mockReadFile.mockResolvedValue(SAMPLE_MAP_JSON);
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.DB_URL;
    delete process.env.API_KEY;
  });

  it('Should_ResolveFromInjectedProvider_When_SecretProviderInjected', async () => {
    // Arrange
    const sut = Envilder.fromMapFile('envilder.json').withSecretProvider(
      createFakeProvider(),
    );

    // Act
    const actual = await sut.resolve();

    // Assert
    expect(actual).toEqual(
      new Map([
        ['DB_URL', 'postgres://fake'],
        ['API_KEY', 'sk-fake'],
      ]),
    );
    expect(mockCreateProvider).not.toHaveBeenCalled();
  });

  it('Should_CheckKeysWithInjectedProvider_When_ProviderCanCheckExistence', async () => {
    // Arrange
    mockReadFile.mockResolvedValue(
      JSON.stringify({ DB_URL: '/app/db-url', TOKEN: '/app/token' }),
    );
    const sut = Envilder.fromMapFile('envilder.json').withSecretProvider(
      createCheckableFakeProvider(),
    );

    // Act
    const actual = await sut.validateContract();

    // Assert
    expect(actual).toEqual({
      isValid: false,
      mapFileErrors: [],
      keys: [
        {
          variable: 'DB_URL',
          path: '/app/db-url',
          provider: SecretProviderType.Aws,
          status: 'exists',
        },
        {
          variable: 'TOKEN',
          path: '/app/token',
          provider: SecretProviderType.Aws,
          status: 'missing',
        },
      ],
    });
    expect(mockCreateProvider).not.toHaveBeenCalled();
  });

  it('Should_ReportEveryKeyAsProviderError_When_InjectedProviderCannotCheckExistence', async () => {
    // Arrange
    const sut = Envilder.fromMapFile('envilder.json').withSecretProvider(
      createFakeProvider(),
    );

    // Act
    const actual = await sut.validateContract();

    // Assert
    expect(actual.isValid).toBe(false);
    expect(actual.keys.map((key) => [key.variable, key.status])).toEqual([
      ['DB_URL', 'provider_error'],
      ['API_KEY', 'provider_error'],
    ]);
    expect(actual.keys[0]?.reason).toBe(
      'The provider cannot check whether a secret exists.',
    );
  });

  it('Should_ThrowContractValidationError_When_InjectedProviderCannotCheckExistence', async () => {
    // Arrange
    const sut = Envilder.fromMapFile('envilder.json')
      .withSecretProvider(createFakeProvider())
      .withContractValidation();

    // Act
    const act = sut.inject();

    // Assert
    await expect(act).rejects.toBeInstanceOf(ContractValidationError);
    expect(process.env.DB_URL).toBeUndefined();
  });

  it('Should_InjectSecrets_When_InjectedProviderPassesContractValidation', async () => {
    // Arrange
    const sut = Envilder.fromMapFile('envilder.json')
      .withSecretProvider(createCheckableFakeProvider())
      .withContractValidation();

    // Act
    await sut.inject();

    // Assert
    expect(process.env.DB_URL).toBe('postgres://fake');
    expect(process.env.API_KEY).toBe('sk-fake');
  });

  it('Should_ReportMapFileErrors_When_ProviderInjectedAndConfigIsIncomplete', async () => {
    // Arrange
    mockReadFile.mockResolvedValue(
      JSON.stringify({ $config: { provider: 'azure' }, DB_URL: 'db-url' }),
    );
    const provider = createCheckableFakeProvider();
    const sut =
      Envilder.fromMapFile('envilder.json').withSecretProvider(provider);

    // Act
    const actual = await sut.validateContract();

    // Assert
    expect(actual.isValid).toBe(false);
    expect(actual.mapFileErrors.map((error) => error.key)).toEqual([
      '$config.vaultUrl',
    ]);
    expect(provider.checkSecretsExist).not.toHaveBeenCalled();
  });

  it('Should_Throw_When_InjectedProviderIsMissing', () => {
    // Arrange
    const sut = Envilder.fromMapFile('envilder.json');

    // Act
    const act = () =>
      sut.withSecretProvider(undefined as unknown as ISecretProvider);

    // Assert
    expect(act).toThrow('provider cannot be null or undefined');
  });
});
