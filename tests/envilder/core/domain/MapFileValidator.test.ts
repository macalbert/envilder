import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import {
  type MapFileValidationContext,
  validateMapFile,
} from '../../../../src/envilder/core/domain/MapFileValidator';
import { MAP_FILE_PROVIDERS } from '../../../../src/envilder/core/domain/ProviderConfiguration';

const SCHEMA_CONTEXT: MapFileValidationContext = {
  overrides: {},
  supportedProviders: MAP_FILE_PROVIDERS,
};

const CLI_CONTEXT: MapFileValidationContext = {
  overrides: {},
  supportedProviders: ['aws', 'azure'],
};

const VAULT_URL = 'https://my-vault.vault.azure.net';
const SECRET_LOOKING_VALUE = 'fake-secret-value-9Zq4Rt7Wm2Lp';

/**
 * Documents on both sides of every rule in `spec/map-file.v1.json`. The
 * validator must reach the same verdict as the schema itself on each one, so
 * the schema stays the source of truth.
 */
const SCHEMA_CASES: ReadonlyArray<readonly [string, unknown]> = [
  ['EmptyObject', {}],
  ['OnlyMappings', { DB_URL: '/app/db', API_KEY: '/app/key' }],
  ['HierarchicalName', { 'Database/Password': '/app/db' }],
  ['DottedAndHyphenatedNames', { 'db.url': '/a', 'api-key': '/b' }],
  [
    'SchemaReference',
    { $schema: 'https://envilder.com/schema/map-file.v1.json' },
  ],
  ['SchemaNotUri', { $schema: 'not a uri' }],
  ['SchemaNotString', { $schema: 5 }],
  ['ReservedKey', { $other: 'x' }],
  ['NumberMapping', { PORT: 5432 }],
  ['ObjectMapping', { DB: { path: '/a' } }],
  ['NullMapping', { DB: null }],
  ['NameWithSpace', { 'DB URL': '/a' }],
  ['NameWithEquals', { 'A=B': '/a' }],
  ['ProtoName', JSON.parse('{"__proto__": "/a"}')],
  ['ConfigNotObject', { $config: 'aws' }],
  ['ConfigArray', { $config: [] }],
  ['UnknownConfigField', { $config: { region: 'eu-west-1' } }],
  [
    'MetadataFields',
    { $config: { name: 'a', description: 'b', owner: 'c', environment: 'd' } },
  ],
  ['NonStringMetadata', { $config: { owner: 5 } }],
  ['UnknownProvider', { $config: { provider: 'vault' } }],
  ['UppercaseProvider', { $config: { provider: 'AWS' } }],
  ['NonStringProvider', { $config: { provider: 1 } }],
  ['AwsWithProfile', { $config: { provider: 'aws', profile: 'dev' } }],
  ['DefaultProviderWithProfile', { $config: { profile: 'dev' } }],
  ['AwsWithVaultUrl', { $config: { provider: 'aws', vaultUrl: VAULT_URL } }],
  ['DefaultProviderWithVaultUrl', { $config: { vaultUrl: VAULT_URL } }],
  ['AwsWithPath', { $config: { provider: 'aws', path: '.env' } }],
  ['AwsWithNamespace', { $config: { provider: 'aws', namespace: 'ns' } }],
  ['AwsWithProjectId', { $config: { provider: 'aws', projectId: 'p' } }],
  [
    'AzureWithVaultUrl',
    { $config: { provider: 'azure', vaultUrl: VAULT_URL } },
  ],
  ['AzureWithoutVaultUrl', { $config: { provider: 'azure' } }],
  [
    'AzureWithProfile',
    { $config: { provider: 'azure', vaultUrl: VAULT_URL, profile: 'dev' } },
  ],
  [
    'AzureWithVaultUrlNotUri',
    { $config: { provider: 'azure', vaultUrl: 'my-vault' } },
  ],
  ['GcpWithProjectId', { $config: { provider: 'gcp', projectId: 'p' } }],
  ['GcpWithoutProjectId', { $config: { provider: 'gcp' } }],
  [
    'GcpWithNamespace',
    { $config: { provider: 'gcp', projectId: 'p', namespace: 'n' } },
  ],
  [
    'HashicorpWithVaultUrlAndNamespace',
    { $config: { provider: 'hashicorp', vaultUrl: VAULT_URL, namespace: 'n' } },
  ],
  ['HashicorpWithoutVaultUrl', { $config: { provider: 'hashicorp' } }],
  ['FileWithPath', { $config: { provider: 'file', path: '.env.test' } }],
  ['FileWithoutPath', { $config: { provider: 'file' } }],
  [
    'FileWithVaultUrl',
    { $config: { provider: 'file', path: '.env', vaultUrl: VAULT_URL } },
  ],
  ['RootArray', []],
  ['RootString', 'envilder'],
  ['RootNull', null],
];

const schemaValidator = (() => {
  const schema = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../../../spec/map-file.v1.json'),
      'utf-8',
    ),
  );
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
})();

describe('validateMapFile', () => {
  it.each(SCHEMA_CASES)(
    'Should_AgreeWithPublishedSchema_When_DocumentIs%s',
    (_name, document) => {
      // Arrange
      const expected = schemaValidator(document);

      // Act
      const actual = validateMapFile(document, SCHEMA_CONTEXT);

      // Assert
      expect(actual.length === 0).toBe(expected);
    },
  );

  it('Should_ReturnNoViolation_When_MapFileMatchesSchema', () => {
    // Arrange
    const document = {
      $schema: 'https://envilder.com/schema/map-file.v1.json',
      $config: { provider: 'azure', vaultUrl: VAULT_URL, owner: 'platform' },
      DB_URL: '/app/db',
    };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportEveryViolationWithItsKey_When_MapFileBreaksSeveralRules', () => {
    // Arrange
    const document = {
      $config: { provider: 'aws', region: 'eu-west-1' },
      $extra: 'x',
      PORT: 5432,
      'DB URL': '/app/db',
    };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual.map((violation) => violation.key)).toEqual([
      '$config.region',
      '$extra',
      'PORT',
      'DB URL',
    ]);
  });

  it('Should_ReportUnsupportedProvider_When_ProviderIsUnknown', () => {
    // Arrange
    const document = { $config: { provider: 'vault' } };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.provider',
        message:
          'Unsupported provider: vault. Supported providers: aws, azure.',
      },
    ]);
  });

  it('Should_ReportUnsupportedProvider_When_SchemaProviderIsNotSupportedByCaller', () => {
    // Arrange
    const document = { $config: { provider: 'gcp', projectId: 'p' } };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual.map((violation) => violation.message)).toEqual([
      'Unsupported provider: gcp. Supported providers: aws, azure.',
    ]);
  });

  it('Should_ReportProfileMessage_When_ProfileIsSetWithAzure', () => {
    // Arrange
    const document = {
      $config: { provider: 'azure', vaultUrl: VAULT_URL, profile: 'dev' },
    };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.profile',
        message:
          '$config.profile is only supported with the aws provider (current provider: azure).',
      },
    ]);
  });

  it('Should_ReportVaultUrlMessage_When_VaultUrlIsSetWithAws', () => {
    // Arrange
    const document = { $config: { vaultUrl: VAULT_URL } };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.vaultUrl',
        message:
          '$config.vaultUrl is only supported with the azure provider (current provider: aws).',
      },
    ]);
  });

  it('Should_ReportExistingVaultUrlRequiredMessage_When_AzureHasNoVaultUrl', () => {
    // Arrange
    const document = { $config: { provider: 'azure' } };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.vaultUrl',
        message:
          'vaultUrl is required when using Azure provider. Set it in $config.vaultUrl in your map file or via --vault-url flag.',
      },
    ]);
  });

  it('Should_ReportFlag_When_ProviderFlagConflictsWithConfigField', () => {
    // Arrange
    const document = { $config: { profile: 'dev' } };
    const context: MapFileValidationContext = {
      ...CLI_CONTEXT,
      overrides: { provider: 'Azure', vaultUrl: VAULT_URL },
    };

    // Act
    const actual = validateMapFile(document, context);

    // Assert
    expect(actual).toEqual([
      {
        key: '$config.profile',
        message:
          '$config.profile is only supported with the aws provider (current provider: azure).',
      },
    ]);
  });

  it('Should_ReportFlag_When_VaultUrlFlagIsGivenForAws', () => {
    // Arrange
    const document = { DB_URL: '/app/db' };
    const context: MapFileValidationContext = {
      ...CLI_CONTEXT,
      overrides: { vaultUrl: VAULT_URL },
    };

    // Act
    const actual = validateMapFile(document, context);

    // Assert
    expect(actual).toEqual([
      {
        key: '--vault-url',
        message:
          '--vault-url is only supported with the azure provider (current provider: aws).',
      },
    ]);
  });

  it('Should_ReturnNoViolation_When_FlagsCompleteAzureConfiguration', () => {
    // Arrange
    const document = { $config: { provider: 'azure' }, DB_URL: 'db-url' };
    const context: MapFileValidationContext = {
      ...CLI_CONTEXT,
      overrides: { vaultUrl: VAULT_URL },
    };

    // Act
    const actual = validateMapFile(document, context);

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_ReportConfigVaultUrl_When_ProviderFlagSwitchesAzureConfigToAws', () => {
    // Arrange
    const document = {
      $config: { provider: 'azure', vaultUrl: VAULT_URL },
      DB_URL: '/app/db',
    };
    const context: MapFileValidationContext = {
      ...CLI_CONTEXT,
      overrides: { provider: 'aws', vaultUrl: '' },
    };

    // Act
    const actual = validateMapFile(document, context);

    // Assert
    expect(actual.map((violation) => violation.key)).toEqual([
      '$config.vaultUrl',
    ]);
  });

  it('Should_NeverIncludeMappedValues_When_ReportingViolations', () => {
    // Arrange
    const document = {
      $config: { provider: 'azure', profile: SECRET_LOOKING_VALUE },
      'BAD NAME': SECRET_LOOKING_VALUE,
      NESTED: { value: SECRET_LOOKING_VALUE },
      LIST: [SECRET_LOOKING_VALUE],
    };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(JSON.stringify(actual)).not.toContain(SECRET_LOOKING_VALUE);
  });

  it('Should_QuoteKey_When_KeyContainsLineBreak', () => {
    // Arrange
    const document = { 'A\nB': 5 };

    // Act
    const actual = validateMapFile(document, CLI_CONTEXT);

    // Assert
    expect(actual.every((violation) => !violation.message.includes('\n'))).toBe(
      true,
    );
  });
});
