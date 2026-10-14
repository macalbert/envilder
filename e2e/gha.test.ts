import 'reflect-metadata';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DeleteParameterCommand,
  GetParameterCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import type { SecretClient } from '@azure/keyvault-secrets';
import {
  LocalstackContainer,
  type StartedLocalStackContainer,
} from '@testcontainers/localstack';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { Startup } from '../src/envilder/apps/gha/Startup';
import { DispatchActionCommand } from '../src/envilder/core/application/dispatch/DispatchActionCommand';
import type { DispatchActionCommandHandler } from '../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import { TYPES } from '../src/envilder/core/types';
import { LocalStackAzureContainer } from '../tests/support/LocalStackAzureContainer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// LocalStack container
const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
let localstackContainer: StartedLocalStackContainer;
let localstackEndpoint: string;
let ssmClient: SSMClient;

// LocalStack for Azure (Azure Key Vault test double)
const AZURE_TEST_TIMEOUT_MS = 30_000;

describe('GitHub Action (E2E)', () => {
  const envFilePath = join(rootDir, 'e2e', 'sample', 'gha-validation.env');
  const mapFilePath = join(rootDir, 'e2e', 'sample', 'envilder.json');
  const mapFileWithConfigPath = join(
    rootDir,
    'e2e',
    'sample',
    'envilder.aws.json',
  );

  beforeAll(async () => {
    if (!process.env.LOCALSTACK_AUTH_TOKEN) {
      throw new Error(
        'LOCALSTACK_AUTH_TOKEN is required. Run `pnpx envilder` to populate .env',
      );
    }
    localstackContainer = await new LocalstackContainer(LOCALSTACK_IMAGE)
      .withName(`localstack-gha-${randomUUID().slice(0, 8)}`)
      .withEnvironment({
        LOCALSTACK_AUTH_TOKEN: process.env.LOCALSTACK_AUTH_TOKEN,
      })
      .start();
    localstackEndpoint = localstackContainer.getConnectionUri();

    ssmClient = new SSMClient({
      endpoint: localstackEndpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });

    execSync('pnpm build', { cwd: rootDir, stdio: 'inherit' });
  }, 120_000);

  afterAll(async () => {
    await localstackContainer.stop();
  });

  beforeEach(async () => {
    // Verify bundle exists and was recently built (within last minute - from global setup)
    const bundlePath = join(rootDir, 'github-action', 'dist', 'index.js');
    if (!existsSync(bundlePath)) {
      throw new Error(
        'GitHub Action bundle not found! Run `pnpm build:gha` first.',
      );
    }

    const ssmParams = readMappings(mapFilePath);
    for (const ssmPath of Object.values(ssmParams)) {
      await DeleteParameterSsm(ssmPath);
    }

    const ssmParamsWithConfig = readMappings(mapFileWithConfigPath);
    for (const ssmPath of Object.values(ssmParamsWithConfig)) {
      await DeleteParameterSsm(ssmPath);
    }

    // Clean up env file
    if (existsSync(envFilePath)) {
      await unlink(envFilePath);
    }
  });

  afterEach(async () => {
    const ssmParams = readMappings(mapFilePath);
    for (const ssmPath of Object.values(ssmParams)) {
      await DeleteParameterSsm(ssmPath);
    }

    const ssmParamsWithConfig = readMappings(mapFileWithConfigPath);
    for (const ssmPath of Object.values(ssmParamsWithConfig)) {
      await DeleteParameterSsm(ssmPath);
    }

    if (existsSync(envFilePath)) {
      await unlink(envFilePath);
    }
  });

  it('Should_GenerateEnvironmentFile_When_ValidInputsAreProvided', async () => {
    // Arrange
    const ssmParams = readMappings(mapFilePath);

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const testValue = `test-value-for-${key}`;
      await SetParameterSsm(ssmPath, testValue);
    }

    // Act
    const result = runGitHubAction({
      mapFile: mapFilePath,
      envFile: envFilePath,
    });

    // Assert
    expect(result.code).toBe(0);
    expect(existsSync(envFilePath)).toBe(true);

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const envFileValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      expect(envFileValue).toBe(ssmValue);
    }
  });

  it('Should_GenerateEnvironmentFile_When_MapFileContainsConfig', async () => {
    // Arrange
    const ssmParams = readMappings(mapFileWithConfigPath);

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const testValue = `test-value-for-${key}`;
      await SetParameterSsm(ssmPath, testValue);
    }

    // Act
    const result = runGitHubAction({
      mapFile: mapFileWithConfigPath,
      envFile: envFilePath,
    });

    // Assert
    expect(result.code).toBe(0);
    expect(existsSync(envFilePath)).toBe(true);

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const envFileValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      expect(envFileValue).toBe(ssmValue);
    }
  });

  it('Should_FailWithError_When_RequiredInputsAreMissing', () => {
    // Act
    const result = runGitHubAction({
      mapFile: '',
      envFile: '',
    });

    // Assert
    expect(result.code).not.toBe(0);
    expect(result.error).toContain('Missing required inputs');
  });

  it('Should_UpdateExistingEnvFile_When_EnvFileAlreadyExists', async () => {
    // Arrange
    const ssmParams = readMappings(mapFilePath);

    const existingContent = 'EXISTING_VAR=existing_value\n';
    writeFileSync(envFilePath, existingContent, 'utf8');

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const testValue = `test-value-for-${key}`;
      await SetParameterSsm(ssmPath, testValue);
      console.log(`Set SSM parameter: ${ssmPath} = ${testValue}`);
    }

    // Act
    console.log(`Executing action with existing .env file...`);
    const result = runGitHubAction({
      mapFile: mapFilePath,
      envFile: envFilePath,
    });

    // Assert
    expect(result.code).toBe(0);
    expect(existsSync(envFilePath)).toBe(true);

    const content = readFileSync(envFilePath, 'utf8');
    console.log(`Final .env content:\n${content}`);
    expect(content).toContain('EXISTING_VAR=existing_value');

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const envFileValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      console.log(
        `Checking ${key}: envFile="${envFileValue}", ssm="${ssmValue}"`,
      );
      expect(envFileValue).toBe(ssmValue);
    }
  }, 30_000);

  describe('Azure Key Vault', { timeout: AZURE_TEST_TIMEOUT_MS }, () => {
    let localStackAzure: LocalStackAzureContainer;
    let azureVaultUrl: string;
    let azureVaultHost: string;
    let azureSecretClient: SecretClient;
    const azureMapFilePath = join(
      rootDir,
      'e2e',
      'sample',
      'envilder-azure-gha.json',
    );
    const azureEnvFilePath = join(
      rootDir,
      'e2e',
      'sample',
      'azure-gha-validation.env',
    );

    beforeAll(async () => {
      localStackAzure = await new LocalStackAzureContainer().start();
      azureVaultUrl = localStackAzure.getVaultUrl();
      azureVaultHost = localStackAzure.getVaultHost();
      azureSecretClient = localStackAzure.createSecretClient();

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
    }, 240_000);

    afterAll(async () => {
      await localStackAzure?.stop();
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
      await azureSecretClient.setSecret('test-secret', 'azure-gha-value');
      const config = { provider: 'azure', vaultUrl: azureVaultUrl };

      // Act — invoke production code directly, passing test vault host
      const container = Startup.build()
        .configureServices()
        .configureInfrastructure(config, {
          allowedVaultHosts: [azureVaultHost],
        })
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
      expect(envValue).toBe('azure-gha-value');
    });
  });
});

/**
 * Simulates GitHub Actions environment by running the action entry point
 * with INPUT_* environment variables (same as real GitHub Actions workflow)
 */
function runGitHubAction(inputs: { mapFile: string; envFile: string }): {
  code: number;
  output: string;
  error: string;
} {
  const actionScript = join(rootDir, 'github-action', 'dist', 'index.js');

  try {
    const output = execSync(`node "${actionScript}"`, {
      cwd: rootDir,
      encoding: 'utf8',
      env: {
        ...process.env,
        // GitHub Actions sets these automatically from action inputs
        INPUT_MAP_FILE: inputs.mapFile,
        INPUT_ENV_FILE: inputs.envFile,
        // Point AWS SDK to LocalStack
        AWS_ENDPOINT_URL: localstackEndpoint,
        AWS_REGION: 'us-east-1',
        AWS_ACCESS_KEY_ID: 'test',
        AWS_SECRET_ACCESS_KEY: 'test',
      },
    });
    return { code: 0, output, error: '' };
  } catch (error: unknown) {
    const err = error as { status?: number; stdout?: string; stderr?: string };
    return {
      code: err.status || 1,
      output: err.stdout?.toString() || '',
      error: err.stderr?.toString() || '',
    };
  }
}

// Helper functions
function readMappings(mapPath: string): Record<string, string> {
  const raw = JSON.parse(readFileSync(mapPath, 'utf8'));
  return Object.fromEntries(
    Object.entries(raw).filter(([key]) => !key.startsWith('$')),
  ) as Record<string, string>;
}

async function SetParameterSsm(name: string, value: string): Promise<void> {
  await ssmClient.send(
    new PutParameterCommand({
      Name: name,
      Value: value,
      Type: 'SecureString',
      Overwrite: true,
    }),
  );
}

async function GetParameterSsm(name: string): Promise<string | undefined> {
  try {
    const response = await ssmClient.send(
      new GetParameterCommand({ Name: name, WithDecryption: true }),
    );
    return response.Parameter?.Value;
  } catch {
    return undefined;
  }
}

async function DeleteParameterSsm(name: string): Promise<void> {
  try {
    await ssmClient.send(new DeleteParameterCommand({ Name: name }));
  } catch {
    // Ignore errors if parameter doesn't exist
  }
}

function GetSecretFromKey(envFilePath: string, key: string): string {
  const content = readFileSync(envFilePath, 'utf8');
  const lines = content.split('\n');
  const line = lines.find((l) => l.startsWith(`${key}=`));
  return line?.split('=')[1] || '';
}
