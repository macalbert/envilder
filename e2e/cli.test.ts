import 'reflect-metadata';
import { execSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { Startup } from '../src/apps/cli/Startup';
import { DispatchActionCommand } from '../src/envilder/application/dispatch/DispatchActionCommand';
import type { DispatchActionCommandHandler } from '../src/envilder/application/dispatch/DispatchActionCommandHandler';
import { TYPES } from '../src/envilder/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const ssmClient = new SSMClient({});

// Lowkey Vault (Azure Key Vault test double)
const LOWKEY_VAULT_IMAGE = 'nagyesta/lowkey-vault:7.1.32';
const LOWKEY_VAULT_PORT = 8443;

describe('Envilder (E2E)', () => {
  beforeAll(async () => {
    await cleanUpSystem();
    execSync('pnpm build', { cwd: rootDir, stdio: 'inherit' });
    execSync('node --loader ts-node/esm scripts/pack-and-install.ts', {
      cwd: rootDir,
      stdio: 'inherit',
    });
  }, 60_000);

  const envilder = 'envilder';
  const envFilePath = join(rootDir, 'e2e', 'sample', 'cli-validation.env');
  const mapFilePath = join(rootDir, 'e2e', 'sample', 'param-map.json');
  const mapFileWithConfigPath = join(
    rootDir,
    'e2e',
    'sample',
    'param-map-with-config.json',
  );
  const singleSsmPath = '/Test/SingleVariable';

  beforeEach(async () => {
    await cleanUpSsm(mapFilePath, singleSsmPath);
    await cleanUpSsm(mapFileWithConfigPath);
  }, 60_000);

  afterEach(async () => {
    await cleanUpSsm(mapFilePath, singleSsmPath);
    await cleanUpSsm(mapFileWithConfigPath);
  }, 60_000);

  afterAll(async () => {
    await cleanUpSystem();
  }, 60_000);

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

    const ssmParams = readMappings(mapFilePath);

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

  it('Should_GenerateEnvironmentFile_When_MapFileContainsConfig', async () => {
    // Arrange
    const params = ['--map', mapFileWithConfigPath, '--envfile', envFilePath];

    const ssmParams = readMappings(mapFileWithConfigPath);

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
    const ssmParams = readMappings(mapFilePath);
    const envContent = Object.keys(ssmParams)
      .map((key) => `${key}=push-test-${key}`)
      .join('\n');
    writeFileSync(envFilePath, envContent, 'utf8');

    const params = ['--push', '--envfile', envFilePath, '--map', mapFilePath];

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

  it('Should_PushEnvFileToSSM_When_MapFileContainsConfig', async () => {
    // Arrange
    const ssmParams = readMappings(mapFileWithConfigPath);
    const envContent = Object.keys(ssmParams)
      .map((key) => `${key}=push-test-${key}`)
      .join('\n');
    writeFileSync(envFilePath, envContent, 'utf8');

    const params = [
      '--push',
      '--envfile',
      envFilePath,
      '--map',
      mapFileWithConfigPath,
    ];

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

  it('Should_SuccessfullyPushAllVariables_When_AllParametersAreValid', async () => {
    // Arrange
    const ssmParams = readMappings(mapFilePath);
    const envContent = Object.keys(ssmParams)
      .map((key) => `${key}=push-test-${key}`)
      .join('\n');
    writeFileSync(envFilePath, envContent, 'utf8');

    const params = ['--push', '--envfile', envFilePath, '--map', mapFilePath];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output).toContain(
      'Successfully pushed environment variables',
    );
    expect(actual.output).not.toContain('Failed to push environment file');
    expect(actual.output).not.toContain('Unknown');

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const expectedValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      expect(ssmValue).toBe(expectedValue);
    }
  });

  describe('Azure Key Vault', () => {
    let lowkeyVaultContainer: StartedTestContainer;
    let azureVaultUrl: string;
    let lowkeyVaultHost: string;
    let azureSecretClient: SecretClient;
    const azureMapFilePath = join(
      rootDir,
      'e2e',
      'sample',
      'param-map-azure.json',
    );
    const azureEnvFilePath = join(
      rootDir,
      'e2e',
      'sample',
      'azure-validation.env',
    );
    let originalTlsReject: string | undefined;

    beforeAll(async () => {
      originalTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      // Self-signed cert on a local test container — safe to skip validation
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      lowkeyVaultContainer = await new GenericContainer(LOWKEY_VAULT_IMAGE)
        .withName(`lowkey-vault-cli-${randomUUID().slice(0, 8)}`)
        .withExposedPorts(LOWKEY_VAULT_PORT, 8080)
        .withEnvironment({
          LOWKEY_ARGS: '--server.port=8443 --LOWKEY_VAULT_RELAXED_PORTS=true',
        })
        .start();

      const host = lowkeyVaultContainer.getHost();
      const port = lowkeyVaultContainer.getMappedPort(LOWKEY_VAULT_PORT);
      const tokenPort = lowkeyVaultContainer.getMappedPort(8080);
      lowkeyVaultHost = host;
      azureVaultUrl = `https://${host}:${port}`;

      // Point DefaultAzureCredential to Lowkey Vault's built-in token endpoint
      process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST = `http://${host}:${tokenPort}`;

      azureSecretClient = new SecretClient(
        azureVaultUrl,
        new DefaultAzureCredential(),
        { disableChallengeResourceVerification: true },
      );

      // Write dynamic map file with container's vault URL
      writeFileSync(
        azureMapFilePath,
        JSON.stringify(
          {
            $config: {
              provider: 'azure',
              vaultUrl: azureVaultUrl,
            },
            VAULT_SECRET: 'test-secret',
          },
          null,
          2,
        ),
      );
    }, 120_000);

    afterAll(async () => {
      if (lowkeyVaultContainer) {
        await lowkeyVaultContainer.stop();
      }
      if (originalTlsReject === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsReject;
      }
      delete process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST;
      if (existsSync(azureMapFilePath)) {
        await unlink(azureMapFilePath);
      }
      if (existsSync(azureEnvFilePath)) {
        await unlink(azureEnvFilePath);
      }
    }, 60_000);

    beforeEach(async () => {
      if (existsSync(azureEnvFilePath)) {
        await unlink(azureEnvFilePath);
      }
    });

    it('Should_PullFromAzureKeyVault_When_MapFileContainsAzureConfig', async () => {
      // Arrange
      await azureSecretClient.setSecret('test-secret', 'azure-secret-value');
      const config = { provider: 'azure', vaultUrl: azureVaultUrl };

      // Act — invoke production code directly, passing test vault host
      const container = Startup.build()
        .configureServices()
        .configureInfrastructure(config, [lowkeyVaultHost])
        .create();
      const handler = container.get<DispatchActionCommandHandler>(
        TYPES.DispatchActionCommandHandler,
      );
      const command = DispatchActionCommand.fromCliOptions({
        map: azureMapFilePath,
        envfile: azureEnvFilePath,
      });
      await handler.handleCommand(command);

      // Assert
      expect(existsSync(azureEnvFilePath)).toBe(true);
      const envValue = GetSecretFromKey(azureEnvFilePath, 'VAULT_SECRET');
      expect(envValue).toBe('azure-secret-value');
    });

    it('Should_PullFromAzureKeyVault_When_VaultUrlProvidedViaConfig', async () => {
      // Arrange
      await azureSecretClient.setSecret('test-secret', 'config-override-value');
      const noUrlMapPath = join(
        rootDir,
        'e2e',
        'sample',
        'param-map-azure-no-url.json',
      );
      writeFileSync(
        noUrlMapPath,
        JSON.stringify(
          {
            $config: { provider: 'azure' },
            VAULT_SECRET: 'test-secret',
          },
          null,
          2,
        ),
      );
      const config = { provider: 'azure', vaultUrl: azureVaultUrl };

      // Act — invoke production code directly, passing test vault host
      const container = Startup.build()
        .configureServices()
        .configureInfrastructure(config, [lowkeyVaultHost])
        .create();
      const handler = container.get<DispatchActionCommandHandler>(
        TYPES.DispatchActionCommandHandler,
      );
      const command = DispatchActionCommand.fromCliOptions({
        map: noUrlMapPath,
        envfile: azureEnvFilePath,
      });
      await handler.handleCommand(command);

      // Assert
      expect(existsSync(azureEnvFilePath)).toBe(true);
      const envValue = GetSecretFromKey(azureEnvFilePath, 'VAULT_SECRET');
      expect(envValue).toBe('config-override-value');

      if (existsSync(noUrlMapPath)) {
        await unlink(noUrlMapPath);
      }
    });
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

    // Uninstall global package (still sync, as pnpm API is not available async)
    try {
      execSync('pnpm remove -g envilder 2>nul', {
        stdio: 'inherit',
        shell: 'cmd',
      });
    } catch {
      // Ignore errors if not installed
    }
  } catch {
    // Ignore errors if not installed
  }
}

function readMappings(mapPath: string): Record<string, string> {
  const raw = JSON.parse(readFileSync(mapPath, 'utf8'));
  const { $config, ...mappings } = raw;
  return mappings as Record<string, string>;
}

async function cleanUpSsm(
  mapFilePath: string,
  singleSsmPath?: string,
): Promise<void> {
  // Clean up all parameters from the map file
  try {
    const ssmParams = readMappings(mapFilePath);
    for (const [, ssmPath] of Object.entries(ssmParams)) {
      await DeleteParameterSsm(ssmPath);
    }
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      console.log('Parameter map file not found:', mapFilePath);
    } else if (error instanceof SyntaxError) {
      console.error('Invalid JSON in parameter map file:', error.message);
    } else {
      console.error('Error reading parameter map file:', error);
    }
  }

  if (singleSsmPath) {
    await DeleteParameterSsm(singleSsmPath);
  }
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
    if (hasNameProperty(error) && error.name === 'ParameterNotFound') {
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

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

function hasNameProperty(error: unknown): error is { name: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as { name?: unknown }).name === 'string'
  );
}

function GetSecretFromKey(envFilePath: string, key: string): string {
  const envLine = readFileSync(envFilePath, 'utf8')
    .split('\n')
    .find((line) => line.startsWith(`${key}=`));
  const value = envLine ? envLine.substring(key.length + 1) : '';
  console.log(`Env File Value for key ${key}: ${value}`);
  return value;
}
