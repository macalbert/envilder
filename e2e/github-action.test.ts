import { execSync } from 'node:child_process';
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
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const ssmClient = new SSMClient({});

// Helper functions
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

describe('GitHub Action (E2E)', () => {
  const envFilePath = join(rootDir, 'e2e', 'sample', 'cli-validation.env');
  const mapFilePath = join(rootDir, 'e2e', 'sample', 'param-map.json');
  const actionScript = join(rootDir, 'lib', 'apps', 'gha', 'index.js');

  beforeAll(async () => {
    // Build the project
    execSync('pnpm build', { cwd: rootDir, stdio: 'inherit' });
  }, 30_000);

  beforeEach(async () => {
    // Clean up SSM parameters before each test
    const ssmParams = JSON.parse(readFileSync(mapFilePath, 'utf8')) as Record<
      string,
      string
    >;
    for (const ssmPath of Object.values(ssmParams)) {
      await DeleteParameterSsm(ssmPath);
    }

    // Clean up env file
    if (existsSync(envFilePath)) {
      await unlink(envFilePath);
    }
  });

  afterEach(async () => {
    // Clean up SSM parameters after each test
    const ssmParams = JSON.parse(readFileSync(mapFilePath, 'utf8')) as Record<
      string,
      string
    >;
    for (const ssmPath of Object.values(ssmParams)) {
      await DeleteParameterSsm(ssmPath);
    }

    // Clean up env file
    if (existsSync(envFilePath)) {
      await unlink(envFilePath);
    }
  });

  it('Should_GenerateEnvironmentFile_When_ValidInputsAreProvided', async () => {
    // Arrange
    const ssmParams = JSON.parse(readFileSync(mapFilePath, 'utf8')) as Record<
      string,
      string
    >;

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const testValue = `test-value-for-${key}`;
      await SetParameterSsm(ssmPath, testValue);
    }

    // Set GitHub Actions environment variables
    process.env.INPUT_MAP_FILE = mapFilePath;
    process.env.INPUT_ENV_FILE = envFilePath;

    // Act
    execSync(`node "${actionScript}"`, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        GITHUB_ACTIONS: 'true',
        INPUT_MAP_FILE: mapFilePath,
        INPUT_ENV_FILE: envFilePath,
      },
    });

    // Assert
    expect(existsSync(envFilePath)).toBe(true);

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const envFileValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      expect(envFileValue).toBe(ssmValue);
    }
  });

  it('Should_FailWithError_When_RequiredInputsAreMissing', () => {
    // Arrange
    delete process.env.INPUT_MAP_FILE;
    delete process.env.INPUT_ENV_FILE;

    // Act
    const action = () => {
      execSync(`node "${actionScript}"`, {
        cwd: rootDir,
        stdio: 'pipe',
        env: {
          ...process.env,
          GITHUB_ACTIONS: 'true',
        },
      });
    };

    // Assert
    expect(action).toThrow();
  });

  it('Should_UpdateExistingEnvFile_When_EnvFileAlreadyExists', async () => {
    // Arrange
    const ssmParams = JSON.parse(readFileSync(mapFilePath, 'utf8')) as Record<
      string,
      string
    >;

    // Create existing env file with some content
    const existingContent = 'EXISTING_VAR=existing_value\n';
    writeFileSync(envFilePath, existingContent, 'utf8');

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const testValue = `test-value-for-${key}`;
      await SetParameterSsm(ssmPath, testValue);
    }

    process.env.INPUT_MAP_FILE = mapFilePath;
    process.env.INPUT_ENV_FILE = envFilePath;

    // Act
    execSync(`node "${actionScript}"`, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        GITHUB_ACTIONS: 'true',
        INPUT_MAP_FILE: mapFilePath,
        INPUT_ENV_FILE: envFilePath,
      },
    });

    // Assert
    expect(existsSync(envFilePath)).toBe(true);

    const content = readFileSync(envFilePath, 'utf8');
    expect(content).toContain('EXISTING_VAR=existing_value');

    for (const [key, ssmPath] of Object.entries(ssmParams)) {
      const envFileValue = GetSecretFromKey(envFilePath, key);
      const ssmValue = await GetParameterSsm(ssmPath);
      console.log(
        `Checking ${key}: envFile="${envFileValue}", ssm="${ssmValue}"`,
      );
      expect(envFileValue).toBe(ssmValue);
    }
  });
});
