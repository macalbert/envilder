import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Map File Schema — File Provider', () => {
  let validate: ReturnType<InstanceType<typeof Ajv2020>['compile']>;

  beforeAll(() => {
    const schemaPath = resolve(__dirname, '../../spec/map-file.v1.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
  });

  it('Should_AcceptMapFile_When_ProviderIsFileWithPath', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'file',
        path: './local-secrets.env',
      },
      DB_URL: 'DB_URL',
      API_KEY: 'API_KEY',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_RejectMapFile_When_ProviderIsFileWithoutPath', () => {
    // Arrange
    const mapFile = {
      $config: { provider: 'file' },
      DB_URL: 'DB_URL',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsFileAndProfilePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'file',
        path: './local-secrets.env',
        profile: 'production',
      },
      DB_URL: 'DB_URL',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsFileAndVaultUrlPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'file',
        path: './local-secrets.env',
        vaultUrl: 'https://vault.example.com',
      },
      DB_URL: 'DB_URL',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsFileAndProjectIdPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'file',
        path: './local-secrets.env',
        projectId: 'my-project',
      },
      DB_URL: 'DB_URL',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsFileAndNamespacePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'file',
        path: './local-secrets.env',
        namespace: 'team-a',
      },
      DB_URL: 'DB_URL',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });
});
