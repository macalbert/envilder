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
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import {
  LocalstackContainer,
  type StartedLocalStackContainer,
} from '@testcontainers/localstack';
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
import { Startup } from '../src/apps/gha/Startup';
import { DispatchActionCommand } from '../src/envilder/application/dispatch/DispatchActionCommand';
import type { DispatchActionCommandHandler } from '../src/envilder/application/dispatch/DispatchActionCommandHandler';
import { TYPES } from '../src/envilder/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// LocalStack container
const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
let localstackContainer: StartedLocalStackContainer;
let localstackEndpoint: string;
let ssmClient: SSMClient;

// Lowkey Vault (Azure Key Vault test double)
const LOWKEY_VAULT_IMAGE = 'nagyesta/lowkey-vault:7.1.32';
const LOWKEY_VAULT_PORT = 8443;

describe('GitHub Action (E2E)', () => {
  const envFilePath = join(rootDir, 'e2e', 'sample', 'cli-validation.env');
  const mapFilePath = join(rootDir, 'e2e', 'sample', 'param-map.json');
  const mapFileWithConfigPath = join(
    rootDir,
    'e2e',
    'sample',
    'param-map-with-aws-config.json',
  );

  beforeAll(async () => {
    localstackContainer = await new LocalstackContainer(LOCALSTACK_IMAGE)
      .withName(`localstack-gha-${randomUUID().slice(0, 8)}`)
      .withEnvironment({
        LOCALSTACK_ACKNOWLEDGE_ACCOUNT_REQUIREMENT: '1',
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
  }, 60_000);

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

  describe('Azure Key Vault', () => {
    let lowkeyVaultContainer: StartedTestContainer;
    let azureVaultUrl: string;
    let lowkeyVaultHost: string;
    let azureSecretClient: SecretClient;
    const azureMapFilePath = join(
      rootDir,
      'e2e',
      'sample',
      'param-map-azure-gha.json',
    );
    const azureEnvFilePath = join(
      rootDir,
      'e2e',
      'sample',
      'azure-gha-validation.env',
    );
    let originalTlsReject: string | undefined;

    beforeAll(async () => {
      originalTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      // Self-signed cert on a local test container — safe to skip validation
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      lowkeyVaultContainer = await new GenericContainer(LOWKEY_VAULT_IMAGE)
        .withName(`lowkey-vault-gha-${randomUUID().slice(0, 8)}`)
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
      await azureSecretClient.setSecret('test-secret', 'azure-gha-value');
      const config = { provider: 'azure', vaultUrl: azureVaultUrl };

      // Act — invoke production code directly, passing test vault host
      const container = Startup.build()
        .configureServices()
        .configureInfrastructure(config, {
          allowedVaultHosts: [lowkeyVaultHost],
          disableChallengeResourceVerification: true,
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
  const { $config, ...mappings } = raw;
  return mappings as Record<string, string>;
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
