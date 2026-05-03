import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Map File Schema — Azure Provider', () => {
  let validate: ReturnType<InstanceType<typeof Ajv2020>['compile']>;

  beforeAll(() => {
    const schemaPath = resolve(__dirname, '../../spec/map-file.v1.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
  });

  it('Should_AcceptMapFile_When_ProviderIsAzureWithVaultUrl', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
      },
      DB_URL: 'my-db-secret',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_RejectMapFile_When_ProviderIsAzureWithoutVaultUrl', () => {
    // Arrange
    const mapFile = {
      $config: { provider: 'azure' },
      DB_URL: 'my-db-secret',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsAzureAndProfilePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
        profile: 'production',
      },
      DB_URL: 'my-db-secret',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsAzureAndProjectIdPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
        projectId: 'my-project',
      },
      DB_URL: 'my-db-secret',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsAzureAndNamespacePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
        namespace: 'team-a',
      },
      DB_URL: 'my-db-secret',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsAzureAndPathPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
        path: './secrets.env',
      },
      DB_URL: 'my-db-secret',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });
});
