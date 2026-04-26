import { PutParameterCommand, type SSMClient } from '@aws-sdk/client-ssm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EnvilderClient } from '../../../../src/sdks/typescript/src/application/envilder-client.js';
import type { ParsedMapFile } from '../../../../src/sdks/typescript/src/domain/parsed-map-file.js';
import type { AwsSsmSecretProvider } from '../../../../src/sdks/typescript/src/infrastructure/aws/aws-ssm-secret-provider.js';
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
});
