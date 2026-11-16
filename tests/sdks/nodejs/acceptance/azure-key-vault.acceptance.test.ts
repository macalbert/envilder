import type { SecretClient } from '@azure/keyvault-secrets';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ContractValidationError,
  checkRemoteKeys,
} from '../../../../src/sdks/nodejs/src/application/contract-validation.js';
import { EnvilderClient } from '../../../../src/sdks/nodejs/src/application/envilder-client.js';
import type { ParsedMapFile } from '../../../../src/sdks/nodejs/src/domain/parsed-map-file.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';
import type { AzureKeyVaultSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';
import { LocalStackAzureTestContainer } from '../containers/localstack-azure-container.js';

let localStackAzure: LocalStackAzureTestContainer;
let secretClient: SecretClient;
let provider: AzureKeyVaultSecretProvider;

describe('Azure Key Vault Acceptance', () => {
  beforeAll(async () => {
    localStackAzure = await new LocalStackAzureTestContainer().start();
    secretClient = localStackAzure.createSecretClient();
    provider = localStackAzure.createProvider();
  }, 300_000);

  afterAll(async () => {
    await localStackAzure.stop();
  });

  it('Should_ResolveSecretFromKeyVault_When_SecretExistsInLocalStack', async () => {
    // Arrange
    await secretClient.setSecret('test-secret', 'vault-secret-value');
    const sut = new EnvilderClient(provider);
    const mapFile: ParsedMapFile = {
      config: {
        provider: SecretProviderType.Azure,
        vaultUrl: localStackAzure.getVaultUrl(),
      },
      mappings: new Map([['VAULT_SECRET', 'test-secret']]),
    };

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.get('VAULT_SECRET')).toBe('vault-secret-value');
  });

  it('Should_ReturnEmptyForMissingKeyVaultSecret_When_SecretDoesNotExist', async () => {
    // Arrange
    const sut = new EnvilderClient(provider);
    const mapFile: ParsedMapFile = {
      config: {
        provider: SecretProviderType.Azure,
        vaultUrl: localStackAzure.getVaultUrl(),
      },
      mappings: new Map([['MISSING', 'nonexistent-secret']]),
    };

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.size).toBe(0);
  });

  it('Should_ReportExistsAndMissingWithoutValues_When_CheckingContract', async () => {
    // Arrange
    await secretClient.setSecret('contract-existing', 'contract-vault-value');
    const mapFile: ParsedMapFile = {
      config: {
        provider: SecretProviderType.Azure,
        vaultUrl: localStackAzure.getVaultUrl(),
      },
      mappings: new Map([
        ['EXISTING', '/contract/existing'],
        ['MISSING', 'contract-missing'],
      ]),
    };

    // Act
    const actual = await checkRemoteKeys(
      mapFile,
      provider,
      SecretProviderType.Azure,
    );

    // Assert
    expect(actual.isValid).toBe(false);
    expect(actual.keys.map((key) => [key.variable, key.status])).toEqual([
      ['EXISTING', 'exists'],
      ['MISSING', 'missing'],
    ]);
    expect(JSON.stringify(actual)).not.toContain('contract-vault-value');
  });

  it('Should_NameMissingKey_When_ContractValidationFailsALoad', async () => {
    // Arrange
    const mapFile: ParsedMapFile = {
      config: {
        provider: SecretProviderType.Azure,
        vaultUrl: localStackAzure.getVaultUrl(),
      },
      mappings: new Map([['MISSING', 'contract-missing']]),
    };
    const result = await checkRemoteKeys(
      mapFile,
      provider,
      SecretProviderType.Azure,
    );

    // Act
    const actual = new ContractValidationError(result);

    // Assert
    expect(actual.message).toBe(
      'Map file contract validation failed: MISSING (contract-missing): missing',
    );
  });
});
