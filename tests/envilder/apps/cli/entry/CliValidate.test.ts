import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import { main } from '../../../../../src/envilder/apps/cli/entry/Cli';
import { SilentExitError } from '../../../../../src/envilder/apps/cli/errors/SilentExitError';
import { Startup } from '../../../../../src/envilder/apps/cli/Startup';
import { createAwsSecretProvider } from '../../../../../src/envilder/core/infrastructure/aws/AwsSecretProviderFactory';
import { createAzureSecretProvider } from '../../../../../src/envilder/core/infrastructure/azure/AzureSecretProviderFactory';

vi.mock(
  '../../../../../src/envilder/core/infrastructure/aws/AwsSecretProviderFactory',
  () => ({ createAwsSecretProvider: vi.fn() }),
);

vi.mock(
  '../../../../../src/envilder/core/infrastructure/azure/AzureSecretProviderFactory',
  () => ({ createAzureSecretProvider: vi.fn() }),
);

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const VAULT_URL = 'https://my-vault.vault.azure.net';
const SECRET_LOOKING_VALUE = 'fake-secret-value-2Hs7Qm5Tc9Wd';

function strip(value: string): string {
  return value.replace(ANSI_PATTERN, '');
}

function outputOf(spy: MockInstance): string {
  return strip(spy.mock.calls.map((call) => call.join(' ')).join('\n'));
}

describe('Cli validate', () => {
  let workDir: string;
  let originalCwd: string;
  let logSpy: MockInstance;
  let errorSpy: MockInstance;

  beforeEach(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'envilder-validate-'));
    originalCwd = process.cwd();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    vi.mocked(createAwsSecretProvider).mockReset();
    vi.mocked(createAzureSecretProvider).mockReset();
    await rm(workDir, { recursive: true, force: true });
  });

  async function givenMapFile(content: unknown, name = 'map.json') {
    const path = join(workDir, name);
    await writeFile(
      path,
      typeof content === 'string' ? content : JSON.stringify(content),
    );
    return path;
  }

  function givenArgs(...args: string[]): void {
    process.argv = ['node', 'envilder', ...args];
  }

  it('Should_ExitZero_When_MapFileMatchesSchema', async () => {
    // Arrange
    const mapPath = await givenMapFile({
      $schema: 'https://envilder.com/schema/map-file.v1.json',
      $config: { provider: 'aws', profile: 'dev' },
      DB_URL: '/app/db-url',
    });
    givenArgs('validate', '--offline', '--map', mapPath);

    // Act
    await main();

    // Assert
    expect(outputOf(logSpy)).toContain('✓ Map file valid');
  });

  it('Should_StateRemoteValidationWasSkipped_When_OfflineIsSet', async () => {
    // Arrange
    const mapPath = await givenMapFile({ DB_URL: '/app/db-url' });
    givenArgs('validate', '--offline', '--map', mapPath);

    // Act
    await main();

    // Assert
    expect(outputOf(logSpy)).toContain('Remote validation skipped');
  });

  it('Should_ReportEveryViolation_When_MapFileBreaksSchema', async () => {
    // Arrange
    const mapPath = await givenMapFile({
      $config: { provider: 'gcloud', region: 'eu-west-1' },
      PORT: 5432,
      DB_URL: '/app/db-url',
    });
    givenArgs('validate', '--offline', '--map', mapPath);

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toEqual(new SilentExitError(1));
    expect(outputOf(errorSpy)).toContain('3 problems');
    expect(outputOf(errorSpy)).toContain('$config.region');
    expect(outputOf(errorSpy)).toContain('PORT');
    expect(outputOf(errorSpy)).toContain('Unsupported provider: gcloud');
  });

  it('Should_ReportParseError_When_MapFileIsNotValidJson', async () => {
    // Arrange
    const mapPath = await givenMapFile(`{ "DB_URL": ${SECRET_LOOKING_VALUE} }`);
    givenArgs('validate', '--offline', '--map', mapPath);

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toEqual(new SilentExitError(1));
    expect(outputOf(errorSpy)).toContain(
      `Invalid JSON in parameter map file: ${mapPath}`,
    );
    expect(outputOf(errorSpy)).not.toContain(SECRET_LOOKING_VALUE);
  });

  it('Should_RejectIncoherentConfig_When_FlagsConflictWithProvider', async () => {
    // Arrange
    const mapPath = await givenMapFile({
      $config: { provider: 'aws' },
      DB_URL: '/app/db-url',
    });
    givenArgs(
      'validate',
      '--offline',
      '--map',
      mapPath,
      '--provider',
      'azure',
      '--profile',
      'dev',
    );

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toEqual(new SilentExitError(1));
    expect(outputOf(errorSpy)).toContain(
      '--profile is only supported with the aws provider (current provider: azure).',
    );
    expect(outputOf(errorSpy)).toContain(
      'vaultUrl is required when using Azure provider.',
    );
  });

  it('Should_RejectIncoherentConfig_When_MapFileSetsVaultUrlWithAws', async () => {
    // Arrange
    const mapPath = await givenMapFile({
      $config: { vaultUrl: VAULT_URL },
      DB_URL: '/app/db-url',
    });
    givenArgs('validate', '--offline', '--map', mapPath);

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toEqual(new SilentExitError(1));
    expect(outputOf(errorSpy)).toContain(
      '$config.vaultUrl is only supported with the azure provider (current provider: aws).',
    );
  });

  it('Should_PreferFlagsOverConfig_When_FlagsFixTheConfiguration', async () => {
    // Arrange
    const mapPath = await givenMapFile({
      $config: { provider: 'azure' },
      DB_URL: 'db-url',
    });
    givenArgs(
      'validate',
      '--offline',
      '--map',
      mapPath,
      '--vault-url',
      VAULT_URL,
    );

    // Act
    await main();

    // Assert
    expect(outputOf(logSpy)).toContain('✓ Map file valid');
  });

  it('Should_NotCallProvider_When_OfflineIsSet', async () => {
    // Arrange
    const configureInfrastructure = vi.spyOn(
      Startup.prototype,
      'configureInfrastructure',
    );
    const mapPath = await givenMapFile({
      $config: { provider: 'azure', vaultUrl: VAULT_URL },
      DB_URL: 'db-url',
    });
    givenArgs('validate', '--offline', '--map', mapPath);

    // Act
    await main();

    // Assert
    expect(configureInfrastructure).not.toHaveBeenCalled();
    expect(createAzureSecretProvider).not.toHaveBeenCalled();
    expect(createAwsSecretProvider).not.toHaveBeenCalled();
  });

  it('Should_UseDefaultMapFile_When_MapIsNotGiven', async () => {
    // Arrange
    await givenMapFile({ DB_URL: '/app/db-url' }, 'envilder.json');
    process.chdir(workDir);
    givenArgs('validate', '--offline');

    // Act
    await main();

    // Assert
    expect(outputOf(logSpy)).toContain('✓ Map file valid: envilder.json');
  });

  it('Should_ReportMissingMapFile_When_NoDefaultMapFileExists', async () => {
    // Arrange
    process.chdir(workDir);
    givenArgs('validate', '--offline');

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toThrow('No map file found');
  });

  it('Should_RejectValidate_When_OfflineIsNotSet', async () => {
    // Arrange
    const mapPath = await givenMapFile({ DB_URL: '/app/db-url' });
    givenArgs('validate', '--map', mapPath);

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toEqual(new SilentExitError(1));
    expect(outputOf(errorSpy)).toContain('envilder validate --offline');
    expect(createAwsSecretProvider).not.toHaveBeenCalled();
  });

  it('Should_RejectRootOptions_When_TheyComeBeforeValidate', async () => {
    // Arrange
    const mapPath = await givenMapFile({ DB_URL: '/app/db-url' });
    givenArgs('--map', mapPath, 'validate', '--offline');

    // Act
    const action = main();

    // Assert
    await expect(action).rejects.toEqual(new SilentExitError(1));
    expect(outputOf(errorSpy)).toContain(
      'Put envilder options after "validate" (found --map).',
    );
  });
});
