import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Map File Schema', () => {
  let validate: ValidateFunction;

  beforeAll(() => {
    const schemaPath = resolve(__dirname, '../../spec/map-file.v1.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
  });

  it('Should_AcceptMapFile_When_Empty', () => {
    // Arrange
    const mapFile = {};

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_AcceptMapFile_When_OnlyMappingsPresent', () => {
    // Arrange
    const mapFile = {
      DB_URL: '/app/db',
      API_KEY: '/app/key',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_AcceptMapFile_When_SchemaAndConfigKeysArePresent', () => {
    // Arrange
    const mapFile = {
      $schema: 'https://envilder.com/schema/map-file.v1.json',
      $config: { provider: 'aws' },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_RejectMapFile_When_UnknownDollarPrefixedKeyIsPresent', () => {
    // Arrange
    const mapFile = {
      $foo: 'bar',
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_ProviderAbsentAndVaultUrlPresent', () => {
    // Arrange
    const mapFile = {
      $config: { vaultUrl: 'https://my-vault.vault.azure.net' },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_RejectMapFile_When_UnknownConfigFieldIsPresent', () => {
    // Arrange
    const mapFile = {
      $config: { provider: 'aws', unknownField: 'value' },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });

  it('Should_AcceptMapFile_When_MetadataFieldsArePresent', () => {
    // Arrange
    const mapFile = {
      $config: {
        provider: 'aws',
        name: 'payments-api',
        description: 'Production secrets',
        owner: 'platform-team',
        environment: 'production',
      },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(true);
  });

  it('Should_RejectMapFile_When_MappingValueIsNotString', () => {
    // Arrange
    const mapFile = {
      DB_URL: 42,
    };

    // Act
    const actual = validate(mapFile);

    // Assert
    expect(actual).toBe(false);
  });
});
