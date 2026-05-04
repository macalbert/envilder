import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Map File Schema — HashiCorp Provider', () => {
  let validate: ReturnType<InstanceType<typeof Ajv2020>['compile']>;

  beforeAll(() => {
    const schemaPath = resolve(__dirname, '../../spec/map-file.v1.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
  });

  it('Should_AcceptMapFile_When_ProviderIsHashicorpWithVaultUrl', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'hashicorp',
        vaultUrl: 'https://vault.example.com:8200',
      },
      DB_PASSWORD: 'secret/data/app/db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_AcceptMapFile_When_ProviderIsHashicorpWithNamespace', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'hashicorp',
        vaultUrl: 'https://vault.example.com:8200',
        namespace: 'team-platform',
      },
      DB_PASSWORD: 'secret/data/app/db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_RejectMapFile_When_ProviderIsHashicorpWithoutVaultUrl', () => {
    // Arrange
    const mapFile = {
      $config: { provider: 'hashicorp' },
      DB_PASSWORD: 'secret/data/app/db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsHashicorpAndProfilePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'hashicorp',
        vaultUrl: 'https://vault.example.com:8200',
        profile: 'production',
      },
      DB_PASSWORD: 'secret/data/app/db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsHashicorpAndProjectIdPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'hashicorp',
        vaultUrl: 'https://vault.example.com:8200',
        projectId: 'my-project',
      },
      DB_PASSWORD: 'secret/data/app/db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsHashicorpAndPathPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'hashicorp',
        vaultUrl: 'https://vault.example.com:8200',
        path: './secrets.env',
      },
      DB_PASSWORD: 'secret/data/app/db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });
});
