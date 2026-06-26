import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAwsSecretProvider,
  resolveRegionWithFallback,
} from '../../../../../src/envilder/core/infrastructure/aws/AwsSecretProviderFactory.js';

const envKeys = [
  'AWS_PROFILE',
  'AWS_CONFIG_FILE',
  'AWS_SHARED_CREDENTIALS_FILE',
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
] as const;

describe('AwsSecretProviderFactory', () => {
  let tempDir: string;
  let configPath: string;
  let credentialsPath: string;
  let savedEnv: Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = {};
    for (const key of envKeys) {
      savedEnv[key] = process.env[key];
    }
    tempDir = mkdtempSync(join(tmpdir(), 'envilder-aws-config-'));
    configPath = join(tempDir, 'config');
    credentialsPath = join(tempDir, 'credentials');
    writeFileSync(credentialsPath, '');
    writeFileSync(configPath, '');
    process.env.AWS_SHARED_CREDENTIALS_FILE = credentialsPath;
    process.env.AWS_CONFIG_FILE = configPath;
  });

  afterEach(() => {
    for (const key of envKeys) {
      const value = savedEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('resolveRegionWithFallback', () => {
    it('Should_ResolveProfileRegion_When_ProfileHasRegionInConfig', async () => {
      // Arrange
      writeFileSync(configPath, '[profile developer]\nregion = us-east-1\n');
      delete process.env.AWS_REGION;
      delete process.env.AWS_DEFAULT_REGION;

      // Act
      const actual = await resolveRegionWithFallback('developer');

      // Assert
      expect(actual).toBe('us-east-1');
    });

    it('Should_FallBackToUsEast1_When_NoRegionResolvable', async () => {
      // Arrange
      writeFileSync(
        configPath,
        '[profile noregion]\nsso_account_id = 123456789012\n',
      );
      delete process.env.AWS_REGION;
      delete process.env.AWS_DEFAULT_REGION;

      // Act
      const actual = await resolveRegionWithFallback('noregion');

      // Assert
      expect(actual).toBe('us-east-1');
    });

    it('Should_PreferAwsRegionEnv_When_AwsRegionIsSet', async () => {
      // Arrange
      writeFileSync(configPath, '[profile developer]\nregion = us-east-1\n');
      process.env.AWS_REGION = 'eu-central-1';
      delete process.env.AWS_DEFAULT_REGION;

      // Act
      const actual = await resolveRegionWithFallback('developer');

      // Assert
      expect(actual).toBe('eu-central-1');
    });

    it('Should_PreferAwsDefaultRegion_When_OnlyAwsDefaultRegionIsSet', async () => {
      // Arrange
      writeFileSync(configPath, '[profile developer]\nregion = us-east-1\n');
      delete process.env.AWS_REGION;
      process.env.AWS_DEFAULT_REGION = 'ap-southeast-2';

      // Act
      const actual = await resolveRegionWithFallback('developer');

      // Assert
      expect(actual).toBe('ap-southeast-2');
    });
  });

  describe('createAwsSecretProvider', () => {
    const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    it('Should_NotMutateAwsProfileEnv_When_ProfileProvided', () => {
      // Arrange
      delete process.env.AWS_PROFILE;

      // Act
      createAwsSecretProvider(
        { provider: 'aws', profile: 'developer' },
        mockLogger,
      );

      // Assert
      expect(process.env.AWS_PROFILE).toBeUndefined();
    });

    it('Should_NotSetAwsProfile_When_NoProfileProvided', () => {
      // Arrange
      delete process.env.AWS_PROFILE;

      // Act
      createAwsSecretProvider({ provider: 'aws' }, mockLogger);

      // Assert
      expect(process.env.AWS_PROFILE).toBeUndefined();
    });
  });
});
