import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Map File Schema — GCP Provider', () => {
  let validate: ReturnType<InstanceType<typeof Ajv2020>['compile']>;

  beforeAll(() => {
    const schemaPath = resolve(__dirname, '../../spec/map-file.v1.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
  });

  it('Should_AcceptMapFile_When_ProviderIsGcpWithProjectId', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'gcp',
        projectId: 'my-gcp-project',
      },
      DB_PASSWORD: 'db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_RejectMapFile_When_ProviderIsGcpWithoutProjectId', () => {
    // Arrange
    const mapFile = {
      $config: { provider: 'gcp' },
      DB_PASSWORD: 'db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsGcpAndProfilePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'gcp',
        projectId: 'my-gcp-project',
        profile: 'production',
      },
      DB_PASSWORD: 'db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsGcpAndVaultUrlPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'gcp',
        projectId: 'my-gcp-project',
        vaultUrl: 'https://vault.example.com',
      },
      DB_PASSWORD: 'db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsGcpAndNamespacePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'gcp',
        projectId: 'my-gcp-project',
        namespace: 'team-a',
      },
      DB_PASSWORD: 'db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsGcpAndPathPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'gcp',
        projectId: 'my-gcp-project',
        path: './secrets.env',
      },
      DB_PASSWORD: 'db-password',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });
});
