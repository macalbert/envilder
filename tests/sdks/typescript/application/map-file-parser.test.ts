import { describe, expect, it } from 'vitest';
import { MapFileParser } from '../../../../src/sdks/typescript/src/application/map-file-parser.js';

describe('MapFileParser', () => {
  it('Should_ParseMappings_When_ValidJsonProvided', () => {
    // Arrange
    const json = JSON.stringify({
      DB_URL: '/app/db-url',
      API_KEY: '/app/api-key',
    });
    const sut = new MapFileParser();

    // Act
    const actual = sut.parse(json);

    // Assert
    expect(actual.mappings.get('DB_URL')).toBe('/app/db-url');
    expect(actual.mappings.get('API_KEY')).toBe('/app/api-key');
    expect(actual.mappings.size).toBe(2);
  });

  it('Should_ParseConfig_When_ConfigSectionPresent', () => {
    // Arrange
    const json = JSON.stringify({
      $config: {
        provider: 'azure',
        vaultUrl: 'https://my-vault.vault.azure.net',
      },
      DB_URL: '/app/db-url',
    });
    const sut = new MapFileParser();

    // Act
    const actual = sut.parse(json);

    // Assert
    expect(actual.config.provider).toBe('azure');
    expect(actual.config.vaultUrl).toBe('https://my-vault.vault.azure.net');
    expect(actual.mappings.get('DB_URL')).toBe('/app/db-url');
  });

  it('Should_ReturnDefaultConfig_When_NoConfigSection', () => {
    // Arrange
    const json = JSON.stringify({ DB_URL: '/app/db-url' });
    const sut = new MapFileParser();

    // Act
    const actual = sut.parse(json);

    // Assert
    expect(actual.config.provider).toBeUndefined();
    expect(actual.config.vaultUrl).toBeUndefined();
    expect(actual.config.profile).toBeUndefined();
  });

  it('Should_SkipNonStringValues_When_MappingsContainNonStrings', () => {
    // Arrange
    const json = JSON.stringify({
      DB_URL: '/app/db-url',
      INVALID: 42,
      ALSO_INVALID: true,
    });
    const sut = new MapFileParser();

    // Act
    const actual = sut.parse(json);

    // Assert
    expect(actual.mappings.size).toBe(1);
    expect(actual.mappings.get('DB_URL')).toBe('/app/db-url');
  });

  it('Should_ParseAwsProfile_When_ConfigHasProfile', () => {
    // Arrange
    const json = JSON.stringify({
      $config: { provider: 'aws', profile: 'staging' },
      DB_URL: '/app/db-url',
    });
    const sut = new MapFileParser();

    // Act
    const actual = sut.parse(json);

    // Assert
    expect(actual.config.provider).toBe('aws');
    expect(actual.config.profile).toBe('staging');
  });

  it('Should_ReturnEmptyMappings_When_OnlyConfigPresent', () => {
    // Arrange
    const json = JSON.stringify({
      $config: { provider: 'aws' },
    });
    const sut = new MapFileParser();

    // Act
    const actual = sut.parse(json);

    // Assert
    expect(actual.mappings.size).toBe(0);
    expect(actual.config.provider).toBe('aws');
  });
});
