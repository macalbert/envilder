import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

const SPEC_SCHEMA = resolve(__dirname, '../../spec/map-file.v1.json');
const PUBLISHED_SCHEMA = resolve(
  __dirname,
  '../../src/website/public/schema/map-file.v1.json',
);

describe('Map File Schema', () => {
  let validate: ValidateFunction;

  beforeAll(() => {
    const schema = JSON.parse(readFileSync(SPEC_SCHEMA, 'utf-8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
  });

  // Every other test here compiles the spec copy, but IDEs fetch the copy the
  // website publishes. Without this guard the published contract can drift
  // from the one under test, and nothing would fail.
  it('Should_MatchSpecCopy_When_ComparingPublishedSchema', () => {
    // Arrange
    const expected = readFileSync(SPEC_SCHEMA, 'utf-8');

    // Act
    const actual = readFileSync(PUBLISHED_SCHEMA, 'utf-8');

    // Assert
    expect(actual).toBe(expected);
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

  it.each([
    '',
    '   ',
    'SAFE=prefix',
    'SAFE\nINJECTED',
    'SAFE\rINJECTED',
    `SAFE${LINE_SEPARATOR}INJECTED`,
    `SAFE${PARAGRAPH_SEPARATOR}INJECTED`,
    '__proto__',
    'LOST NAME',
    'LOST\tNAME',
    'LOST#NAME',
    'CAFÉ_URL',
    // Trailing terminators: `$` is end-of-input in ECMAScript regexes only
    // while the `m` flag is off, so these pin that the pattern never gains it.
    'SAFE\n',
    'SAFE\r',
    'SAFE\r\n',
    `SAFE${LINE_SEPARATOR}`,
    `SAFE${PARAGRAPH_SEPARATOR}`,
  ])(
    'Should_RejectMapFile_When_MappingNameIsEmptyWhitespaceOrContainsInvalidDelimiter',
    (invalidName) => {
      // Arrange
      const mapFile = { [invalidName]: '/simple' };

      // Act
      const actual = validate(mapFile);

      // Assert
      expect(actual).toBe(false);
    },
  );

  it('Should_AcceptMapFile_When_MappingNamesContainDotsOrHyphens', () => {
    // Arrange
    const mapFile = {
      'APP.NAME': '/app/dotted',
      'APP-NAME': '/app/hyphenated',
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
