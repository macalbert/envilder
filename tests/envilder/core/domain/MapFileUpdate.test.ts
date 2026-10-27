import { describe, expect, it } from 'vitest';
import {
  decideMapFileUpdate,
  MAP_FILE_SCHEMA_URL,
  type MapFileTarget,
  resolveMapFileTarget,
} from '../../../../src/envilder/core/domain/MapFileUpdate';

const AWS: MapFileTarget = { provider: 'aws' };
const AZURE: MapFileTarget = {
  provider: 'azure',
  vaultUrl: 'https://my-vault.vault.azure.net',
};
const KEY = 'API_KEY';
const SECRET_PATH = '/envilder/demo/api-key';
const MAP_FILE = 'envilder.json';

describe('resolveMapFileTarget', () => {
  it('Should_DefaultToAws_When_ConfigHasNoProvider', () => {
    // Arrange
    const config = {};

    // Act
    const actual = resolveMapFileTarget(config);

    // Assert
    expect(actual).toEqual({ provider: 'aws' });
  });

  it('Should_LowercaseProviderAndKeepVaultUrl_When_ProviderIsAzure', () => {
    // Arrange
    const config = { provider: 'AZURE', vaultUrl: AZURE.vaultUrl };

    // Act
    const actual = resolveMapFileTarget(config);

    // Assert
    expect(actual).toEqual(AZURE);
  });

  it('Should_IgnoreVaultUrlAndProfile_When_ProviderIsAws', () => {
    // Arrange
    const config = {
      provider: 'aws',
      vaultUrl: 'https://ignored.vault.azure.net',
      profile: 'dev',
    };

    // Act
    const actual = resolveMapFileTarget(config);

    // Assert
    expect(actual).toEqual({ provider: 'aws' });
  });
});

describe('decideMapFileUpdate', () => {
  it('Should_CreateAwsFileWithoutSchema_When_DefaultMapFileDoesNotExist', () => {
    // Arrange
    const existing = null;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'create',
      content: `${JSON.stringify({ [KEY]: SECRET_PATH }, null, 2)}\n`,
    });
  });

  it.each([
    'envilder.json',
    'envilder.local.json',
    'envilder.prod.json',
    'config/envilder.json',
    'C:\\repo\\envilder.staging.json',
  ])('Should_OmitSchema_When_SchemaStoreCoversFileName(%s)', (mapFile) => {
    // Act
    const actual = decideMapFileUpdate(null, KEY, SECRET_PATH, AWS, mapFile);

    // Assert
    expect(JSON.stringify(actual)).not.toContain('$schema');
  });

  it.each([
    'config/secrets.json',
    'envilder-prod.json',
    'my-envilder.json',
    'envilder.jsonc',
  ])('Should_AddSchema_When_SchemaStoreDoesNotCoverFileName(%s)', (mapFile) => {
    // Act
    const actual = decideMapFileUpdate(null, KEY, SECRET_PATH, AWS, mapFile);

    // Assert
    expect(actual).toEqual({
      kind: 'create',
      content: `${JSON.stringify(
        { $schema: MAP_FILE_SCHEMA_URL, [KEY]: SECRET_PATH },
        null,
        2,
      )}
`,
    });
  });

  it('Should_CreateAzureFileWithConfig_When_FileDoesNotExist', () => {
    // Arrange
    const existing = null;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AZURE,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'create',
      content: `${JSON.stringify(
        {
          $config: { provider: 'azure', vaultUrl: AZURE.vaultUrl },
          [KEY]: SECRET_PATH,
        },
        null,
        2,
      )}\n`,
    });
  });

  it('Should_NeverPersistProfile_When_CreatingFile', () => {
    // Arrange
    const target = { provider: 'aws', profile: 'dev' } as MapFileTarget;

    // Act
    const actual = decideMapFileUpdate(
      null,
      KEY,
      SECRET_PATH,
      target,
      MAP_FILE,
    );

    // Assert
    expect(actual).toMatchObject({ kind: 'create' });
    expect(JSON.stringify(actual)).not.toContain('profile');
  });

  it('Should_AppendKeyAtTheEnd_When_FileExistsWithOtherKeys', () => {
    // Arrange
    const existing = `${JSON.stringify({ B_KEY: '/b', A_KEY: '/a' }, null, 2)}\n`;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `${JSON.stringify(
        { B_KEY: '/b', A_KEY: '/a', [KEY]: SECRET_PATH },
        null,
        2,
      )}\n`,
    });
  });

  it('Should_PreserveFourSpaceIndent_When_FileUsesFourSpaces', () => {
    // Arrange
    const existing = '{\n    "B_KEY": "/b"\n}\n';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `{\n    "B_KEY": "/b",\n    "${KEY}": "${SECRET_PATH}"\n}\n`,
    });
  });

  it('Should_PreserveTabIndent_When_FileUsesTabs', () => {
    // Arrange
    const existing = '{\n\t"B_KEY": "/b"\n}\n';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `{\n\t"B_KEY": "/b",\n\t"${KEY}": "${SECRET_PATH}"\n}\n`,
    });
  });

  it('Should_PreserveCrlfLineEndings_When_FileUsesCrlf', () => {
    // Arrange
    const existing = '{\r\n  "B_KEY": "/b"\r\n}\r\n';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `{\r\n  "B_KEY": "/b",\r\n  "${KEY}": "${SECRET_PATH}"\r\n}\r\n`,
    });
  });

  it('Should_NotAddTrailingNewline_When_FileHadNone', () => {
    // Arrange
    const existing = '{\n  "B_KEY": "/b"\n}';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `{\n  "B_KEY": "/b",\n  "${KEY}": "${SECRET_PATH}"\n}`,
    });
  });

  it('Should_NotAddSchema_When_ExistingFileLacksIt', () => {
    // Arrange
    const existing = '{\n  "B_KEY": "/b"\n}\n';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toMatchObject({ kind: 'append' });
    expect(JSON.stringify(actual)).not.toContain('$schema');
  });

  it('Should_KeepConfigAndDollarKeysUntouched_When_Appending', () => {
    // Arrange
    const original = {
      $schema: 'https://example.com/custom.json',
      $config: { provider: 'azure', vaultUrl: AZURE.vaultUrl },
      $note: 'keep me',
      B_KEY: '/b',
    };
    const existing = `${JSON.stringify(original, null, 2)}\n`;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AZURE,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `${JSON.stringify({ ...original, [KEY]: SECRET_PATH }, null, 2)}\n`,
    });
  });

  it('Should_UseTwoSpacesAndLf_When_ExistingFileIsEmptyObject', () => {
    // Arrange
    const existing = '{}';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `{\n  "${KEY}": "${SECRET_PATH}"\n}`,
    });
  });

  it('Should_ReturnUnchanged_When_KeyAlreadyMappedToSamePath', () => {
    // Arrange
    const existing = `{"${KEY}":"${SECRET_PATH}"}`;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({ kind: 'unchanged' });
  });

  it('Should_ReturnConflict_When_KeyMappedToDifferentPath', () => {
    // Arrange
    const existing = `{"${KEY}":"/some/other/path"}`;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({ kind: 'conflict' });
  });

  it('Should_ReturnConflict_When_KeyHoldsNonStringValue', () => {
    // Arrange
    const existing = `{"${KEY}":123}`;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({ kind: 'conflict' });
  });

  it('Should_AppendSilently_When_AnotherKeyUsesTheSamePath', () => {
    // Arrange
    const existing = `{"OTHER_KEY":"${SECRET_PATH}"}`;

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toMatchObject({ kind: 'append' });
  });

  it('Should_ReturnTargetMismatch_When_FileTargetsAzureAndPushTargetsAws', () => {
    // Arrange
    const existing = JSON.stringify({
      $config: { provider: 'azure', vaultUrl: AZURE.vaultUrl },
    });

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({ kind: 'targetMismatch', fileTarget: AZURE });
  });

  it('Should_ReturnTargetMismatch_When_FileHasNoConfigAndPushTargetsAzure', () => {
    // Arrange
    const existing = '{"B_KEY":"/b"}';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AZURE,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({ kind: 'targetMismatch', fileTarget: AWS });
  });

  it('Should_ReturnTargetMismatch_When_VaultUrlDiffers', () => {
    // Arrange
    const existing = JSON.stringify({
      $config: { provider: 'azure', vaultUrl: 'https://other.vault.azure.net' },
    });

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AZURE,
      MAP_FILE,
    );

    // Assert
    expect(actual).toMatchObject({ kind: 'targetMismatch' });
  });

  it('Should_NotReturnMismatch_When_VaultUrlDiffersOnlyByCaseAndTrailingSlash', () => {
    // Arrange
    const existing = JSON.stringify({
      $config: {
        provider: 'azure',
        vaultUrl: 'HTTPS://My-Vault.vault.azure.net/',
      },
    });

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AZURE,
      MAP_FILE,
    );

    // Assert
    expect(actual).toMatchObject({ kind: 'append' });
  });

  it('Should_NotReturnMismatch_When_OnlyProfileDiffers', () => {
    // Arrange
    const existing = JSON.stringify({
      $config: { provider: 'aws', profile: 'prod' },
    });

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toMatchObject({ kind: 'append' });
  });

  it('Should_PreferTargetMismatchOverConflict_When_BothApply', () => {
    // Arrange
    const existing = JSON.stringify({
      $config: { provider: 'azure', vaultUrl: AZURE.vaultUrl },
      [KEY]: '/some/other/path',
    });

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toMatchObject({ kind: 'targetMismatch' });
  });

  it('Should_ReturnInvalidJson_When_ExistingContentIsNotJson', () => {
    // Arrange
    const existing = '{ not json';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({ kind: 'invalidJson' });
  });

  it('Should_ReturnInvalidJson_When_ExistingContentIsNotAnObject', () => {
    // Arrange
    const existing = '["a"]';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({ kind: 'invalidJson' });
  });

  it('Should_KeepProtoKeyAsData_When_ExistingFileDeclaresIt', () => {
    // Arrange
    const existing = '{\n  "__proto__": "/p"\n}\n';

    // Act
    const actual = decideMapFileUpdate(
      existing,
      KEY,
      SECRET_PATH,
      AWS,
      MAP_FILE,
    );

    // Assert
    expect(actual).toEqual({
      kind: 'append',
      content: `{\n  "__proto__": "/p",\n  "${KEY}": "${SECRET_PATH}"\n}\n`,
    });
  });
});
