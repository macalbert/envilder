import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveRegionWithFallback } from '../../../../src/sdks/nodejs/src/infrastructure/secret-provider-factory.js';

const ENV_KEYS = [
  'AWS_PROFILE',
  'AWS_CONFIG_FILE',
  'AWS_SHARED_CREDENTIALS_FILE',
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
];

describe('resolveRegionWithFallback', () => {
  let savedEnv: Record<string, string | undefined>;
  let tempDir: string;

  beforeEach(() => {
    savedEnv = {};
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
    }
    tempDir = mkdtempSync(join(tmpdir(), 'envilder-sdk-aws-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    for (const key of ENV_KEYS) {
      const value = savedEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('Should_ResolveProfileRegion_When_ProfileHasRegionInConfig', async () => {
    // Arrange
    const configFile = join(tempDir, 'config');
    const credentialsFile = join(tempDir, 'credentials');
    writeFileSync(configFile, '[profile developer]\nregion = us-east-1');
    writeFileSync(credentialsFile, '');
    process.env.AWS_CONFIG_FILE = configFile;
    process.env.AWS_SHARED_CREDENTIALS_FILE = credentialsFile;
    delete process.env.AWS_REGION;
    delete process.env.AWS_DEFAULT_REGION;

    // Act
    const actual = await resolveRegionWithFallback('developer');

    // Assert
    expect(actual).toBe('us-east-1');
  });

  it('Should_FallBackToUsEast1_When_NoRegionResolvable', async () => {
    // Arrange
    const configFile = join(tempDir, 'config');
    const credentialsFile = join(tempDir, 'credentials');
    writeFileSync(
      configFile,
      '[profile noregion]\nsso_account_id = 123456789012',
    );
    writeFileSync(credentialsFile, '');
    process.env.AWS_CONFIG_FILE = configFile;
    process.env.AWS_SHARED_CREDENTIALS_FILE = credentialsFile;
    delete process.env.AWS_REGION;
    delete process.env.AWS_DEFAULT_REGION;

    // Act
    const actual = await resolveRegionWithFallback('noregion');

    // Assert
    expect(actual).toBe('us-east-1');
  });

  it('Should_PreferAwsRegionEnv_When_AwsRegionIsSet', async () => {
    // Arrange
    const configFile = join(tempDir, 'config');
    const credentialsFile = join(tempDir, 'credentials');
    writeFileSync(configFile, '[profile developer]\nregion = us-east-1');
    writeFileSync(credentialsFile, '');
    process.env.AWS_CONFIG_FILE = configFile;
    process.env.AWS_SHARED_CREDENTIALS_FILE = credentialsFile;
    process.env.AWS_REGION = 'eu-central-1';
    delete process.env.AWS_DEFAULT_REGION;

    // Act
    const actual = await resolveRegionWithFallback('developer');

    // Assert
    expect(actual).toBe('eu-central-1');
  });

  it('Should_PreferAwsDefaultRegion_When_OnlyAwsDefaultRegionIsSet', async () => {
    // Arrange
    const configFile = join(tempDir, 'config');
    const credentialsFile = join(tempDir, 'credentials');
    writeFileSync(configFile, '[profile developer]\nregion = us-east-1');
    writeFileSync(credentialsFile, '');
    process.env.AWS_CONFIG_FILE = configFile;
    process.env.AWS_SHARED_CREDENTIALS_FILE = credentialsFile;
    delete process.env.AWS_REGION;
    process.env.AWS_DEFAULT_REGION = 'ap-southeast-2';

    // Act
    const actual = await resolveRegionWithFallback('developer');

    // Assert
    expect(actual).toBe('ap-southeast-2');
  });
});
