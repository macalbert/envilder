import type { SecretClient } from '@azure/keyvault-secrets';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EnvilderClient } from '../../../../src/sdks/nodejs/src/application/envilder-client.js';
import type { ParsedMapFile } from '../../../../src/sdks/nodejs/src/domain/parsed-map-file.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';
import type { AzureKeyVaultSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';
import { LowkeyVaultTestContainer } from '../containers/lowkey-vault-container.js';

let lowkeyVault: LowkeyVaultTestContainer;
let secretClient: SecretClient;
let provider: AzureKeyVaultSecretProvider;

describe('Azure Key Vault Acceptance', () => {
  beforeAll(async () => {
    lowkeyVault = await new LowkeyVaultTestContainer().start();
    secretClient = lowkeyVault.createSecretClient();
    provider = lowkeyVault.createProvider();
  }, 120_000);

  afterAll(async () => {
    await lowkeyVault.stop();
  });

  it('Should_ResolveSecretFromKeyVault_When_SecretExistsInLowkeyVault', async () => {
    // Arrange
    await secretClient.setSecret('test-secret', 'vault-secret-value');
    const sut = new EnvilderClient(provider);
    const mapFile: ParsedMapFile = {
      config: {
        provider: SecretProviderType.Azure,
        vaultUrl: lowkeyVault.getVaultUrl(),
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
        vaultUrl: lowkeyVault.getVaultUrl(),
      },
      mappings: new Map([['MISSING', 'nonexistent-secret']]),
    };

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.size).toBe(0);
  });
});
