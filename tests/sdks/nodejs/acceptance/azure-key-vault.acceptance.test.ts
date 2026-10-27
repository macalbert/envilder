import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { SecretClient } from '@azure/keyvault-secrets';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Envilder } from '../../../../src/sdks/nodejs/src/application/envilder.js';
import { EnvilderClient } from '../../../../src/sdks/nodejs/src/application/envilder-client.js';
import type { ParsedMapFile } from '../../../../src/sdks/nodejs/src/domain/parsed-map-file.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';
import type { AzureKeyVaultSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/azure/azure-key-vault-secret-provider.js';
import { LocalStackAzureTestContainer } from '../containers/localstack-azure-container.js';

let localStackAzure: LocalStackAzureTestContainer;
let secretClient: SecretClient;
let provider: AzureKeyVaultSecretProvider;
let tempDir: string;

describe('Azure Key Vault Acceptance', () => {
  beforeAll(async () => {
    localStackAzure = await new LocalStackAzureTestContainer().start();
    secretClient = localStackAzure.createSecretClient();
    provider = localStackAzure.createProvider();
    tempDir = await mkdtemp(path.join(tmpdir(), 'envilder-azure-'));
  }, 300_000);

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
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

  it('Should_ResolveSecretThroughFacade_When_EmulatorHostIsAllowed', async () => {
    // Arrange
    await secretClient.setSecret('facade-secret', 'facade-value');
    const mapPath = path.join(tempDir, 'envilder.json');
    await writeFile(
      mapPath,
      JSON.stringify({
        $config: { provider: 'azure', vaultUrl: localStackAzure.getVaultUrl() },
        FACADE_SECRET: 'facade-secret',
      }),
    );
    const sut = Envilder.fromMapFile(mapPath).withAllowedVaultHosts(
      '.localhost.localstack.cloud',
    );

    // Act
    const actual = await sut.resolve();

    // Assert
    expect(Object.fromEntries(actual)).toEqual({
      FACADE_SECRET: 'facade-value',
    });
  });
});
