import { describe, expect, it, vi } from 'vitest';
import {
  ContractValidationError,
  checkRemoteKeys,
  invalidMapFileResult,
} from '../../../../src/sdks/nodejs/src/application/contract-validation.js';
import type { SecretExistence } from '../../../../src/sdks/nodejs/src/domain/contract-validation-result.js';
import type { ParsedMapFile } from '../../../../src/sdks/nodejs/src/domain/parsed-map-file.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';

function checkerReturning(entries: Record<string, SecretExistence>) {
  return {
    checkSecretsExist: vi.fn(async () => new Map(Object.entries(entries))),
  };
}

function mapFileWith(mappings: Record<string, string>): ParsedMapFile {
  return { config: {}, mappings: new Map(Object.entries(mappings)) };
}

describe('checkRemoteKeys', () => {
  it('Should_BeValid_When_EverySecretExists', async () => {
    // Arrange
    const checker = checkerReturning({
      '/app/db': { status: 'exists' },
      '/app/key': { status: 'exists' },
    });
    const mapFile = mapFileWith({ DB_URL: '/app/db', API_KEY: '/app/key' });

    // Act
    const actual = await checkRemoteKeys(
      mapFile,
      checker,
      SecretProviderType.Aws,
    );

    // Assert
    expect(actual).toEqual({
      isValid: true,
      mapFileErrors: [],
      keys: [
        {
          variable: 'DB_URL',
          path: '/app/db',
          provider: SecretProviderType.Aws,
          status: 'exists',
        },
        {
          variable: 'API_KEY',
          path: '/app/key',
          provider: SecretProviderType.Aws,
          status: 'exists',
        },
      ],
    });
  });

  it('Should_BeInvalid_When_ASecretIsMissing', async () => {
    // Arrange
    const checker = checkerReturning({
      '/app/db': { status: 'exists' },
      '/app/key': { status: 'missing' },
    });
    const mapFile = mapFileWith({ DB_URL: '/app/db', API_KEY: '/app/key' });

    // Act
    const actual = await checkRemoteKeys(
      mapFile,
      checker,
      SecretProviderType.Aws,
    );

    // Assert
    expect(actual.isValid).toBe(false);
    expect(actual.keys[1]).toEqual({
      variable: 'API_KEY',
      path: '/app/key',
      provider: SecretProviderType.Aws,
      status: 'missing',
    });
  });

  it('Should_CheckSharedPathOnce_When_VariablesShareAPath', async () => {
    // Arrange
    const checker = checkerReturning({ '/app/db': { status: 'exists' } });
    const mapFile = mapFileWith({ DB_URL: '/app/db', DATABASE: '/app/db' });

    // Act
    const actual = await checkRemoteKeys(
      mapFile,
      checker,
      SecretProviderType.Aws,
    );

    // Assert
    expect(checker.checkSecretsExist).toHaveBeenCalledWith(['/app/db']);
    expect(actual.keys).toHaveLength(2);
  });

  it('Should_ReportProviderError_When_CheckerReturnsNoResultForAPath', async () => {
    // Arrange
    const checker = checkerReturning({});
    const mapFile = mapFileWith({ DB_URL: '/app/db' });

    // Act
    const actual = await checkRemoteKeys(
      mapFile,
      checker,
      SecretProviderType.Azure,
    );

    // Assert
    expect(actual.keys[0].status).toBe('provider_error');
    expect(actual.isValid).toBe(false);
  });

  it('Should_BeValidWithoutProviderCall_When_MapFileHasNoMappings', async () => {
    // Arrange
    const checker = checkerReturning({});

    // Act
    const actual = await checkRemoteKeys(
      mapFileWith({}),
      checker,
      SecretProviderType.Aws,
    );

    // Assert
    expect(actual.isValid).toBe(true);
    expect(checker.checkSecretsExist).not.toHaveBeenCalled();
  });
});

describe('ContractValidationError', () => {
  it('Should_NameFailingKeysAndStatuses_When_KeysFail', () => {
    // Arrange
    const result = {
      isValid: false,
      mapFileErrors: [],
      keys: [
        {
          variable: 'DB_URL',
          path: '/app/db',
          provider: SecretProviderType.Aws,
          status: 'exists' as const,
        },
        {
          variable: 'API_KEY',
          path: '/app/key',
          provider: SecretProviderType.Aws,
          status: 'access_denied' as const,
          reason: 'not authorized',
        },
      ],
    };

    // Act
    const actual = new ContractValidationError(result);

    // Assert
    expect(actual.message).toBe(
      'Map file contract validation failed: API_KEY (/app/key): access_denied',
    );
    expect(actual.result).toBe(result);
    expect(actual.name).toBe('ContractValidationError');
  });

  it('Should_ListMapFileErrors_When_MapFileIsInvalid', () => {
    // Act
    const actual = new ContractValidationError(
      invalidMapFileResult([
        { key: '$config.vaultUrl', message: 'vaultUrl is required.' },
      ]),
    );

    // Assert
    expect(actual.message).toBe(
      'Map file contract validation failed: $config.vaultUrl: vaultUrl is required.',
    );
    expect(actual.result.keys).toEqual([]);
  });
});
