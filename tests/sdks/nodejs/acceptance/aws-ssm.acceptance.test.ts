import { PutParameterCommand, type SSMClient } from '@aws-sdk/client-ssm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ContractValidationError,
  checkRemoteKeys,
} from '../../../../src/sdks/nodejs/src/application/contract-validation.js';
import { EnvilderClient } from '../../../../src/sdks/nodejs/src/application/envilder-client.js';
import type { ParsedMapFile } from '../../../../src/sdks/nodejs/src/domain/parsed-map-file.js';
import { SecretProviderType } from '../../../../src/sdks/nodejs/src/domain/secret-provider-type.js';
import type { AwsSsmSecretProvider } from '../../../../src/sdks/nodejs/src/infrastructure/aws/aws-ssm-secret-provider.js';
import { LocalStackTestContainer } from '../containers/localstack-container.js';

let localstack: LocalStackTestContainer;
let ssmClient: SSMClient;
let provider: AwsSsmSecretProvider;

describe('AWS SSM Acceptance', () => {
  beforeAll(async () => {
    localstack = await new LocalStackTestContainer().start();
    ssmClient = localstack.getSsmClient();
    provider = localstack.createProvider();
  }, 120_000);

  afterAll(async () => {
    await localstack.stop();
  });

  it('Should_ResolveSecretFromSsm_When_ParameterExistsInLocalStack', async () => {
    // Arrange
    await ssmClient.send(
      new PutParameterCommand({
        Name: '/Test/MySecret',
        Value: 'real-secret-from-localstack',
        Type: 'SecureString',
        Overwrite: true,
      }),
    );
    const sut = new EnvilderClient(provider);
    const mapFile: ParsedMapFile = {
      config: {},
      mappings: new Map([['MY_SECRET', '/Test/MySecret']]),
    };

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.get('MY_SECRET')).toBe('real-secret-from-localstack');
  });

  it('Should_ReturnEmptyForMissingSsmParameter_When_ParameterDoesNotExist', async () => {
    // Arrange
    const sut = new EnvilderClient(provider);
    const mapFile: ParsedMapFile = {
      config: {},
      mappings: new Map([['NONEXISTENT', '/Test/DoesNotExist']]),
    };

    // Act
    const actual = await sut.resolveSecrets(mapFile);

    // Assert
    expect(actual.size).toBe(0);
  });

  it('Should_ReportExistsAndMissingWithoutValues_When_CheckingContract', async () => {
    // Arrange
    await ssmClient.send(
      new PutParameterCommand({
        Name: '/Test/Contract/Existing',
        Value: 'contract-ssm-value',
        Type: 'SecureString',
        Overwrite: true,
      }),
    );
    const mappings = new Map([
      ['EXISTING', '/Test/Contract/Existing'],
      ['MISSING', '/Test/Contract/Missing'],
    ]);
    for (let i = 0; i < 11; i++) {
      mappings.set(`EXTRA_${i}`, '/Test/Contract/Existing');
    }
    const mapFile: ParsedMapFile = { config: {}, mappings };

    // Act
    const actual = await checkRemoteKeys(
      mapFile,
      provider,
      SecretProviderType.Aws,
    );

    // Assert
    expect(actual.isValid).toBe(false);
    expect(actual.keys.slice(0, 2)).toEqual([
      {
        variable: 'EXISTING',
        path: '/Test/Contract/Existing',
        provider: SecretProviderType.Aws,
        status: 'exists',
      },
      {
        variable: 'MISSING',
        path: '/Test/Contract/Missing',
        provider: SecretProviderType.Aws,
        status: 'missing',
      },
    ]);
    expect(JSON.stringify(actual)).not.toContain('contract-ssm-value');
  });

  it('Should_ReportExistsForEveryKey_When_BatchExceedsTenNames', async () => {
    // Arrange
    const mappings = new Map<string, string>();
    for (let i = 0; i < 12; i++) {
      const name = `/Test/Contract/Batch/${i}`;
      await ssmClient.send(
        new PutParameterCommand({
          Name: name,
          Value: `value-${i}`,
          Type: 'String',
          Overwrite: true,
        }),
      );
      mappings.set(`BATCH_${i}`, name);
    }

    // Act
    const actual = await checkRemoteKeys(
      { config: {}, mappings },
      provider,
      SecretProviderType.Aws,
    );

    // Assert
    expect(actual.isValid).toBe(true);
    expect(actual.keys).toHaveLength(12);
  });

  it('Should_NameMissingKey_When_ContractValidationFailsALoad', async () => {
    // Arrange
    const result = await checkRemoteKeys(
      {
        config: {},
        mappings: new Map([['MISSING', '/Test/Contract/Missing']]),
      },
      provider,
      SecretProviderType.Aws,
    );

    // Act
    const actual = new ContractValidationError(result);

    // Assert
    expect(actual.message).toBe(
      'Map file contract validation failed: MISSING (/Test/Contract/Missing): missing',
    );
  });
});
