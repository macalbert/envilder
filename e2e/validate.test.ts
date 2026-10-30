import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PutParameterCommand, SSM } from '@aws-sdk/client-ssm';
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
  type MockInstance,
  vi,
} from 'vitest';
import { main } from '../src/envilder/apps/cli/entry/Cli';
import { SilentExitError } from '../src/envilder/apps/cli/errors/SilentExitError';
import { LocalStackAzureContainer } from '../tests/support/LocalStackAzureContainer';

const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const AZURE_TEST_TIMEOUT_MS = 30_000;

/**
 * Runs `envilder validate` in process, as the CLI entry point does, against
 * LocalStack for AWS SSM and LocalStack for Azure Key Vault.
 */
describe('envilder validate (E2E)', () => {
  const runId = randomUUID().slice(0, 8);
  const secretValue = `validate-secret-value-${runId}`;
  let workDir: string;
  let logSpy: MockInstance;
  let errorSpy: MockInstance;

  beforeAll(async () => {
    workDir = await mkdtemp(join(tmpdir(), `envilder-validate-e2e-${runId}-`));
  });

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function output(): string {
    return [...logSpy.mock.calls, ...errorSpy.mock.calls]
      .map((call) => call.join(' '))
      .join('\n')
      .replace(ANSI_PATTERN, '');
  }

  async function givenMapFile(content: unknown): Promise<string> {
    const path = join(workDir, `map-${randomUUID().slice(0, 8)}.json`);
    await writeFile(path, JSON.stringify(content));
    return path;
  }

  function validate(mapPath: string): Promise<void> {
    process.argv = ['node', 'envilder', 'validate', '--map', mapPath];
    return main();
  }

  describe('AWS SSM', () => {
    const prefix = `/envilder-validate/${runId}`;
    let container: StartedLocalStackContainer;

    beforeAll(async () => {
      if (!process.env.LOCALSTACK_AUTH_TOKEN) {
        throw new Error(
          'LOCALSTACK_AUTH_TOKEN is required. Run `pnpx envilder` to populate .env',
        );
      }
      container = await new LocalstackContainer(LOCALSTACK_IMAGE)
        .withName(`localstack-validate-${runId}`)
        .withEnvironment({
          LOCALSTACK_AUTH_TOKEN: process.env.LOCALSTACK_AUTH_TOKEN,
        })
        .start();
      const endpoint = container.getConnectionUri();
      vi.stubEnv('AWS_ENDPOINT_URL', endpoint);
      vi.stubEnv('AWS_REGION', 'us-east-1');
      vi.stubEnv('AWS_ACCESS_KEY_ID', 'test');
      vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test');
      vi.stubEnv('AWS_PROFILE', undefined);
      const ssm = new SSM({ endpoint });
      await ssm.send(
        new PutParameterCommand({
          Name: `${prefix}/db-url`,
          Value: secretValue,
          Type: 'SecureString',
        }),
      );
      await ssm.send(
        new PutParameterCommand({
          Name: `${prefix}/api-key`,
          Value: secretValue,
          Type: 'String',
        }),
      );
    }, 120_000);

    afterAll(async () => {
      vi.unstubAllEnvs();
      await container?.stop();
    });

    it('Should_ReportExists_When_AllRemoteKeysExist', async () => {
      // Arrange
      const mapPath = await givenMapFile({
        $config: { provider: 'aws' },
        DB_URL: `${prefix}/db-url`,
        DATABASE_URL: `${prefix}/db-url`,
        API_KEY: `${prefix}/api-key`,
      });

      // Act
      await validate(mapPath);

      // Assert
      expect(output()).toContain(`DB_URL        ${prefix}/db-url   exists`);
      expect(output()).toContain('✓ All 3 secrets exist');
    });

    it('Should_ReportEachMissingKey_When_RemoteKeysDoNotExist', async () => {
      // Arrange
      const mapPath = await givenMapFile({
        DB_URL: `${prefix}/db-url`,
        MISSING_ONE: `${prefix}/missing-one`,
        MISSING_TWO: `${prefix}/missing-two`,
      });

      // Act
      const action = validate(mapPath);

      // Assert
      await expect(action).rejects.toEqual(new SilentExitError(1));
      expect(output()).toContain(`MISSING_ONE  ${prefix}/missing-one  missing`);
      expect(output()).toContain(`MISSING_TWO  ${prefix}/missing-two  missing`);
      expect(output()).toContain('✗ Validation failed: 2 missing');
    });

    it('Should_NeverPrintSecretValues_When_ValidationSucceedsOrFails', async () => {
      // Arrange
      const mapPath = await givenMapFile({
        DB_URL: `${prefix}/db-url`,
        API_KEY: `${prefix}/api-key`,
        MISSING: `${prefix}/missing`,
      });

      // Act
      const action = validate(mapPath);

      // Assert
      await expect(action).rejects.toEqual(new SilentExitError(1));
      expect(output()).not.toContain(secretValue);
    });
  });

  describe('Azure Key Vault', { timeout: AZURE_TEST_TIMEOUT_MS }, () => {
    let localStackAzure: LocalStackAzureContainer;
    let secretClient: SecretClient;
    let vaultUrl: string;

    beforeAll(async () => {
      localStackAzure = await new LocalStackAzureContainer().start();
      vaultUrl = localStackAzure.getVaultUrl();
      secretClient = localStackAzure.createSecretClient();
      vi.stubEnv(
        'ENVILDER_ALLOWED_VAULT_HOSTS',
        localStackAzure.getVaultHost(),
      );
      await secretClient.setSecret('validate-db-url', secretValue);
    }, 240_000);

    afterAll(async () => {
      vi.unstubAllEnvs();
      await localStackAzure?.stop();
    });

    it('Should_ReportExists_When_AllRemoteKeysExist', async () => {
      // Arrange
      const mapPath = await givenMapFile({
        $config: { provider: 'azure', vaultUrl },
        DB_URL: '/validate/db/url',
      });

      // Act
      await validate(mapPath);

      // Assert
      expect(output()).toContain('DB_URL  /validate/db/url  exists');
      expect(output()).toContain('✓ 1 secret exists');
    });

    it('Should_ReportEachMissingKey_When_RemoteKeysDoNotExist', async () => {
      // Arrange
      const mapPath = await givenMapFile({
        $config: { provider: 'azure', vaultUrl },
        DB_URL: 'validate-db-url',
        API_KEY: 'validate-api-key',
      });

      // Act
      const action = validate(mapPath);

      // Assert
      await expect(action).rejects.toEqual(new SilentExitError(1));
      expect(output()).toContain('API_KEY  validate-api-key  missing');
      expect(output()).toContain('✗ Validation failed: 1 missing');
      expect(output()).not.toContain(secretValue);
    });
  });
});
