import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { rm, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DeleteParameterCommand,
  GetParameterCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { glob } from 'glob';
import pc from 'picocolors';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const ssmClient = new SSMClient({});

describe('Envilder (E2E)', () => {
  beforeAll(async () => {
    await cleanUpSystem();
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    execSync('node --loader ts-node/esm scripts/pack-and-install.ts', {
      cwd: rootDir,
      stdio: 'inherit',
    });
  }, 30_000);

  const envilder = 'envilder';
  const envFilePath = join(rootDir, 'e2e', 'sample', 'cli-validation.env');
  const mapFilePath = join(rootDir, 'e2e', 'sample', 'param-map.json');
  const singleSsmPath = '/Test/SingleVariable';

  beforeEach(async () => {
    await cleanUpSsm(mapFilePath, singleSsmPath);
  });

  afterEach(async () => {
    await cleanUpSsm(mapFilePath, singleSsmPath);
  });

  afterAll(async () => {
    await cleanUpSystem();
  });

  it('Should_PrintCorrectVersion_When_VersionFlagIsProvided', async () => {
    // Arrange
    const params = ['--version'];
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    const expectedVersion = pkg.version;

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output.trim()).toBe(expectedVersion);
  });

  it('Should_PrintHelpWithExpectedOptions_When_HelpFlagIsProvided', async () => {
    // Arrange
    const params = ['--help'];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output).toContain('--map');
    expect(actual.output).toContain('--envfile');
  });

  it('Should_GenerateEnvironmentFile_When_ValidArgumentsAreProvided', async () => {
    // Arrange
    const params = ['--map', mapFilePath, '--envfile', envFilePath];

    const ssmParams = JSON.parse(readFileSync(mapFilePath, 'utf8')) as Record<
      string,
      string
    >;

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const testValue = `test-value-for-${key}`;
      await SetParameterSsm(ssmPath, testValue);
    }

    if (existsSync(envFilePath)) {
      await unlink(envFilePath);
    }

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    expect(existsSync(envFilePath)).toBe(true);

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const envFileValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      expect(envFileValue).toBe(ssmValue);
    }
  });

  it('Should_FailWithInvalidArguments_When_InvalidArgumentsAreProvided', async () => {
    // Arrange
    const params = ['--invalid'];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).not.toBe(0);
    expect(actual.output).toContain('error');
  });

  it('Should_ShowErrorMessage_When_RequiredOptionsAreMissing', async () => {
    // Arrange
    const params: string[] = [];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.output).toContain(
      'Missing required arguments: --map and --envfile',
    );
  });

  it('Should_PushEnvFileToSSM_When_PushFlagIsUsed', async () => {
    // Arrange
    const params = ['--push', '--envfile', envFilePath, '--map', mapFilePath];

    const ssmParams = JSON.parse(readFileSync(mapFilePath, 'utf8')) as Record<
      string,
      string
    >;

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const expectedValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      expect(ssmValue).toBe(expectedValue);
    }
  });

  it('Should_PushSingle_When_KeyValueAndSsmPathProvided', async () => {
    // Arrange
    const key = 'SINGLE_VARIABLE';
    const value = 'single-value-test';

    const params = [
      '--key',
      key,
      '--value',
      value,
      '--ssm-path',
      singleSsmPath,
    ];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    const ssmValue = await GetParameterSsm(singleSsmPath);
    expect(ssmValue).toBe(value);
  });

  it('Should_ShowErrorMessage_When_AzureProviderUsedWithoutVaultUrl', async () => {
    // Arrange
    const params = [
      '--provider',
      'azure',
      '--key',
      'TEST_KEY',
      '--value',
      'test-value',
      '--ssm-path',
      '/test/path',
    ];

    // Save current env
    const originalVaultUrl = process.env.AZURE_KEY_VAULT_URL;
    delete process.env.AZURE_KEY_VAULT_URL;

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.output).toContain(
      'AZURE_KEY_VAULT_URL environment variable is required when using Azure provider',
    );

    // Restore env
    if (originalVaultUrl) {
      process.env.AZURE_KEY_VAULT_URL = originalVaultUrl;
    }
  });

  it('Should_AcceptAwsProviderFlag_When_ProviderIsExplicitlySet', async () => {
    // Arrange
    const key = 'AWS_PROVIDER_TEST';
    const value = 'aws-test-value';

    const params = [
      '--provider',
      'aws',
      '--key',
      key,
      '--value',
      value,
      '--ssm-path',
      singleSsmPath,
    ];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    const ssmValue = await GetParameterSsm(singleSsmPath);
    expect(ssmValue).toBe(value);
  });
});

function runCommand(
  command: string,
  args: string[],
): Promise<{ code: number; output: string }> {
  console.log(
    `${pc.bold(pc.bgCyan(pc.black(' [CLI TEST] INPUT ')))} ${pc.cyan(`${command} ${args.join(' ')}`)}`,
  );
  return new Promise((resolve) => {
    const proc = spawn(command, args, { shell: true });
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    proc.on('close', (code) => {
      console.log(
        `${pc.bold(pc.bgYellow(pc.black(' [CLI TEST] OUTPUT ')))} [exit code: ${code}]\n${pc.yellow(output.trim() ? output : '[no output]')}`,
      );
      resolve({ code: code ?? 0, output });
    });
  });
}

async function cleanUpSystem() {
  try {
    const libPath = join(rootDir, 'lib');
    await rm(libPath, { recursive: true, force: true });

    // Delete envilder-*.tgz files
    const tgzFiles = await glob('envilder-*.tgz', { cwd: rootDir });
    const tgzPaths = tgzFiles.map((f) => join(rootDir, f));

    for (const file of tgzPaths) {
      await unlink(file);
    }

    // Uninstall global package (still sync, as npm API is not available async)
    execSync('npm uninstall -g envilder', { stdio: 'inherit' });
  } catch {
    // Ignore errors if not installed
  }
}

async function cleanUpSsm(
  mapFilePath: string,
  singleSsmPath: string,
): Promise<void> {
  // Clean up all parameters from the map file
  try {
    const ssmParams = JSON.parse(readFileSync(mapFilePath, 'utf8')) as Record<
      string,
      string
    >;
    for (const [, ssmPath] of Object.entries(ssmParams)) {
      await DeleteParameterSsm(ssmPath);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Parameter map file not found:', mapFilePath);
    } else if (error instanceof SyntaxError) {
      console.error('Invalid JSON in parameter map file:', error.message);
    } else {
      console.error('Error reading parameter map file:', error);
    }
  }

  await DeleteParameterSsm(singleSsmPath);
}

async function GetParameterSsm(ssmPath: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: ssmPath,
    WithDecryption: true,
  });
  const response = await ssmClient.send(command);
  const value = response.Parameter?.Value || '';
  console.log(`SSM Value for path ${ssmPath}: ${value}`);
  return value;
}

async function DeleteParameterSsm(ssmPath: string): Promise<void> {
  try {
    const command = new DeleteParameterCommand({
      Name: ssmPath,
    });
    await ssmClient.send(command);
    console.log(`Deleted SSM parameter at path ${ssmPath}`);
  } catch (error) {
    if (error.name === 'ParameterNotFound') {
      console.log(`SSM parameter ${ssmPath} does not exist, nothing to delete`);
    } else {
      console.error(`Error deleting SSM parameter at path ${ssmPath}:`, error);
    }
  }
}

async function SetParameterSsm(ssmPath: string, value: string): Promise<void> {
  try {
    const command = new PutParameterCommand({
      Name: ssmPath,
      Value: value,
      Type: 'SecureString',
      Overwrite: true,
    });
    await ssmClient.send(command);
    console.log(`Set SSM parameter at path ${ssmPath} with value: ${value}`);
  } catch (error) {
    console.error(`Error setting SSM parameter at path ${ssmPath}:`, error);
    throw error;
  }
}

function GetSecretFromKey(envFilePath: string, key: string): string {
  const envLine = readFileSync(envFilePath, 'utf8')
    .split('\n')
    .find((line) => line.startsWith(`${key}=`));
  const value = envLine ? envLine.substring(key.length + 1) : '';
  console.log(`Env File Value for key ${key}: ${value}`);
  return value;
}

// Azure E2E Tests - Run only when Azure credentials are available
describe.skipIf(!process.env.AZURE_KEY_VAULT_URL)(
  'Envilder (E2E) - Azure Provider',
  () => {
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL as string;
    let azureClient: SecretClient;

    beforeAll(async () => {
      await cleanUpSystem();
      execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
      execSync('node --loader ts-node/esm scripts/pack-and-install.ts', {
        cwd: rootDir,
        stdio: 'inherit',
      });

      // Initialize Azure client for cleanup
      const credential = new DefaultAzureCredential();
      azureClient = new SecretClient(vaultUrl, credential);
    }, 30_000);

    afterAll(async () => {
      await cleanUpSystem();
    });

    const envilder = 'envilder';
    const envFilePath = join(rootDir, 'e2e', 'sample', 'cli-validation.env');
    const mapFilePath = join(rootDir, 'e2e', 'sample', 'param-map.json');

    // Helper to normalize secret name for Azure (same logic as AzureKeyVaultSecretProvider)
    function normalizeSecretName(name: string): string {
      let normalized = name.replace(/^\/+/, '');
      normalized = normalized.replace(/[/_]/g, '-');
      normalized = normalized.replace(/[^a-zA-Z0-9-]/g, '');
      normalized = normalized.replace(/-+/g, '-');
      normalized = normalized.replace(/^-+|-+$/g, '');
      if (normalized.length > 0 && !/^[a-zA-Z]/.test(normalized)) {
        normalized = `secret-${normalized}`;
      }
      if (normalized.length > 127) {
        normalized = normalized.substring(0, 127);
      }
      if (normalized.length === 0) {
        normalized = 'secret';
      }
      return normalized;
    }

    async function GetAzureSecret(secretName: string): Promise<string> {
      const normalized = normalizeSecretName(secretName);
      const secret = await azureClient.getSecret(normalized);
      console.log(
        `Azure Secret Value for ${secretName} (${normalized}): ${secret.value}`,
      );
      return secret.value || '';
    }

    async function DeleteAzureSecret(secretName: string): Promise<void> {
      try {
        const normalized = normalizeSecretName(secretName);
        const poller = await azureClient.beginDeleteSecret(normalized);
        await poller.pollUntilDone();
        console.log(`Deleted Azure secret ${secretName} (${normalized})`);
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'statusCode' in error &&
          error.statusCode === 404
        ) {
          console.log(
            `Azure secret ${secretName} does not exist, nothing to delete`,
          );
        } else {
          console.error(`Error deleting Azure secret ${secretName}:`, error);
        }
      }
    }

    async function SetAzureSecret(
      secretName: string,
      value: string,
    ): Promise<void> {
      try {
        const normalized = normalizeSecretName(secretName);
        await azureClient.setSecret(normalized, value);
        console.log(
          `Set Azure secret ${secretName} (${normalized}) with value: ${value}`,
        );
      } catch (error) {
        console.error(`Error setting Azure secret ${secretName}:`, error);
        throw error;
      }
    }

    async function cleanUpAzure(
      mapFilePath: string,
      singlePath: string,
    ): Promise<void> {
      // Clean up all parameters from the map file
      try {
        const secretParams = JSON.parse(
          readFileSync(mapFilePath, 'utf8'),
        ) as Record<string, string>;
        for (const [, secretPath] of Object.entries(secretParams)) {
          await DeleteAzureSecret(secretPath);
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log('Parameter map file not found:', mapFilePath);
        } else if (error instanceof SyntaxError) {
          console.error('Invalid JSON in parameter map file:', error.message);
        } else {
          console.error('Error reading parameter map file:', error);
        }
      }

      await DeleteAzureSecret(singlePath);
    }

    beforeEach(async () => {
      await cleanUpAzure(mapFilePath, '/Test/SingleVariable');
    });

    afterEach(async () => {
      await cleanUpAzure(mapFilePath, '/Test/SingleVariable');
    });

    it('Should_GenerateEnvironmentFile_When_ValidArgumentsAreProvidedWithAzure', async () => {
      // Arrange
      const params = [
        '--provider',
        'azure',
        '--map',
        mapFilePath,
        '--envfile',
        envFilePath,
      ];

      const secretParams = JSON.parse(
        readFileSync(mapFilePath, 'utf8'),
      ) as Record<string, string>;

      for (const [key, secretPath] of Object.entries(secretParams)) {
        const testValue = `azure-test-value-for-${key}`;
        await SetAzureSecret(secretPath, testValue);
      }

      if (existsSync(envFilePath)) {
        await unlink(envFilePath);
      }

      // Act
      const actual = await runCommand(envilder, params);

      // Assert
      expect(actual.code).toBe(0);
      expect(existsSync(envFilePath)).toBe(true);

      for (const [key, secretPath] of Object.entries(secretParams)) {
        const envFileValue = GetSecretFromKey(envFilePath, key);
        const azureValue = await GetAzureSecret(secretPath);
        expect(envFileValue).toBe(azureValue);
      }
    });

    it('Should_PushEnvFileToAzure_When_PushFlagIsUsed', async () => {
      // Arrange
      const params = [
        '--provider',
        'azure',
        '--push',
        '--envfile',
        envFilePath,
        '--map',
        mapFilePath,
      ];

      const secretParams = JSON.parse(
        readFileSync(mapFilePath, 'utf8'),
      ) as Record<string, string>;

      // Act
      const actual = await runCommand(envilder, params);

      // Assert
      expect(actual.code).toBe(0);
      for (const [key, secretPath] of Object.entries(secretParams)) {
        const expectedValue = GetSecretFromKey(envFilePath, key);
        const azureValue = await GetAzureSecret(secretPath);
        expect(azureValue).toBe(expectedValue);
      }
    });

    it('Should_PushSingleToAzure_When_KeyValueAndSsmPathProvided', async () => {
      // Arrange
      const key = 'AZURE_SINGLE_VARIABLE';
      const value = 'azure-single-value-test';
      const azurePath = '/Test/AzureSingleVariable';

      const params = [
        '--provider',
        'azure',
        '--key',
        key,
        '--value',
        value,
        '--ssm-path',
        azurePath,
      ];

      // Act
      const actual = await runCommand(envilder, params);

      // Assert
      expect(actual.code).toBe(0);
      const azureValue = await GetAzureSecret(azurePath);
      expect(azureValue).toBe(value);

      // Cleanup
      await DeleteAzureSecret(azurePath);
    });
  },
);
