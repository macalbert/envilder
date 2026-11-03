import { describe, expect, it } from 'vitest';
import {
  validateMapFile,
  validateMapFileContent,
} from '../../../../src/sdks/nodejs/src/application/map-file-validator.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';

describe('validateMapFile', () => {
  it('Should_ReturnNoErrors_When_AwsMapFileIsValid', () => {
    // Arrange
    const document = {
      $schema: 'https://envilder.com/schema/map-file.v1.json',
      $config: { provider: 'aws', profile: 'dev', name: 'app' },
      DB_URL: '/app/db-url',
      'Database/Password': '/app/db-password',
    };

    // Act
    const actual = validateMapFile(document, {});

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReturnNoErrors_When_AzureMapFileHasVaultUrl', () => {
    // Arrange
    const document = {
      $config: { provider: 'azure', vaultUrl: 'https://kv.vault.azure.net' },
      API_KEY: 'api-key',
    };

    // Act
    const actual = validateMapFile(document, {});

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportRoot_When_DocumentIsNotAnObject', () => {
    // Act
    const actual = validateMapFile(['DB_URL'], {});

    // Assert
    expect(actual).toEqual([
      { key: '(root)', message: 'The map file must be a JSON object.' },
    ]);
  });

  it('Should_ReportTypeWithoutValue_When_MappingIsNotAString', () => {
    // Arrange
    const document = { DB_URL: 12345, API_KEY: { nested: 'pasted-secret' } };

    // Act
    const actual = validateMapFile(document, {});

    // Assert
    expect(actual).toEqual([
      {
        key: 'DB_URL',
        message: 'DB_URL must map to a string secret path, not a number.',
      },
      {
        key: 'API_KEY',
        message: 'API_KEY must map to a string secret path, not an object.',
      },
    ]);
    expect(JSON.stringify(actual)).not.toContain('pasted-secret');
  });

  it('Should_ReportName_When_VariableNameIsInvalid', () => {
    // Arrange
    const document = { 'BAD NAME': '/app/x' };

    // Act
    const actual = validateMapFile(document, {});

    // Assert
    expect(actual).toHaveLength(1);
    expect(actual[0].key).toBe('BAD NAME');
    expect(actual[0].message).toContain(
      'Invalid environment variable name "BAD NAME"',
    );
  });

  it('Should_ReportReservedKey_When_KeyStartsWithDollar', () => {
    // Act
    const actual = validateMapFile({ $other: 'x' }, {});

    // Assert
    expect(actual).toEqual([
      {
        key: '$other',
        message:
          '$other is reserved: only $schema and $config may start with "$".',
      },
    ]);
  });

  it('Should_ReportUnknownAndMistypedConfigFields_When_ConfigIsInvalid', () => {
    // Arrange
    const document = { $config: { region: 'eu-west-1', profile: 42 } };

    // Act
    const actual = validateMapFile(document, {});

    // Assert
    expect(actual.map((error) => error.key)).toEqual([
      '$config.region',
      '$config.profile',
    ]);
    expect(actual[1].message).toBe(
      '$config.profile must be a string, not a number.',
    );
  });

  it('Should_ReportUri_When_VaultUrlIsNotAbsolute', () => {
    // Arrange
    const document = { $config: { provider: 'azure', vaultUrl: 'kv-name' } };

    // Act
    const actual = validateMapFile(document, {});

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.vaultUrl',
        message: '$config.vaultUrl must be an absolute URI.',
      },
    ]);
  });

  it('Should_ReportUnsupportedProvider_When_ProviderIsNotAwsOrAzure', () => {
    // Act
    const actual = validateMapFile(
      { $config: { provider: 'gcp', projectId: 'p' } },
      {},
    );

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.provider',
        message: 'Unsupported provider: gcp. Supported providers: aws, azure.',
      },
    ]);
  });

  it('Should_ReportRequiredVaultUrl_When_AzureHasNoVaultUrl', () => {
    // Act
    const actual = validateMapFile({ $config: { provider: 'azure' } }, {});

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.vaultUrl',
        message:
          'vaultUrl is required when using Azure provider. Set it in' +
          ' $config.vaultUrl in your map file or via withVaultUrl().',
      },
    ]);
  });

  it('Should_ReportProfile_When_ProfileIsUsedWithAzure', () => {
    // Arrange
    const document = {
      $config: {
        provider: 'azure',
        vaultUrl: 'https://kv.vault.azure.net',
        profile: 'dev',
      },
    };

    // Act
    const actual = validateMapFile(document, {});

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.profile',
        message:
          '$config.profile is only supported with the aws provider (current provider: azure).',
      },
    ]);
  });

  it('Should_ReportVaultUrl_When_VaultUrlIsUsedWithAws', () => {
    // Act
    const actual = validateMapFile(
      { $config: { vaultUrl: 'https://kv.vault.azure.net' } },
      {},
    );

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.vaultUrl',
        message:
          '$config.vaultUrl is only supported with the azure provider (current provider: aws).',
      },
    ]);
  });

  it('Should_NameBuilderMethod_When_OverrideBreaksConfiguration', () => {
    // Act
    const actual = validateMapFile(
      {
        $config: { provider: 'azure', vaultUrl: 'https://kv.vault.azure.net' },
      },
      { profile: 'dev' },
    );

    // Assert
    expect(actual).toEqual([
      {
        key: 'withProfile()',
        message:
          'withProfile() is only supported with the aws provider (current provider: azure).',
      },
    ]);
  });

  it('Should_UseOverrides_When_TheyFixConfiguration', () => {
    // Act
    const actual = validateMapFile(
      { $config: { provider: 'azure' } },
      {
        provider: SecretProviderType.Azure,
        vaultUrl: 'https://kv.vault.azure.net',
      },
    );

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_IgnoreBlankOverride_When_OverrideIsWhitespace', () => {
    // Act
    const actual = validateMapFile({ DB_URL: '/app/db' }, { vaultUrl: '  ' });

    // Assert
    expect(actual).toEqual([]);
  });
});

describe('validateMapFileContent', () => {
  it('Should_ReportInvalidJsonWithoutContent_When_JsonDoesNotParse', () => {
    // Act
    const actual = validateMapFileContent('{"DB_URL": "pasted-secret"', {});

    // Assert
    expect(actual).toEqual([
      { key: '(root)', message: 'The map file is not valid JSON.' },
    ]);
  });
});
