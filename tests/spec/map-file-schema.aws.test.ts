import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Map File Schema — AWS Provider', () => {
  let validate: ReturnType<InstanceType<typeof Ajv2020>['compile']>;

  beforeAll(() => {
    const schemaPath = resolve(__dirname, '../../spec/map-file.v1.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
  });

  it('Should_AcceptMapFile_When_ProviderIsAws', () => {
    // Arrange
    const mapFile = {
      $config: { provider: 'aws' },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_AcceptMapFile_When_ProviderIsAwsWithProfile', () => {
    // Arrange
    const mapFile = {
      $config: { provider: 'aws', profile: 'production' },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_AcceptMapFile_When_ProviderAbsentAndProfilePresent', () => {
    // Arrange — no provider means default aws
    const mapFile = {
      $config: { profile: 'staging' },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_RejectMapFile_When_ProviderIsAwsAndVaultUrlPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'aws',
        vaultUrl: 'https://vault.example.com',
      },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsAwsAndProjectIdPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'aws',
        projectId: 'my-project',
      },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsAwsAndNamespacePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'aws',
        namespace: 'team-a',
      },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderIsAwsAndPathPresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'aws',
        path: './secrets.env',
      },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });
});
