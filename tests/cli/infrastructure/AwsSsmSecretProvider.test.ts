import { PutParameterCommand, SSM } from '@aws-sdk/client-ssm';
import {
  LocalstackContainer,
  type StartedLocalStackContainer,
} from '@testcontainers/localstack';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AwsSsmSecretProvider } from '../../../src/cli/infrastructure/Aws/AwsSsmSecretProvider';

const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
const PARAM_NAME = '/test/secret';
const PARAM_VALUE = 'super-secret-value';

describe('AwsSsmSecretProvider (integration with LocalStack)', () => {
  let container: StartedLocalStackContainer;
  let endpoint: string;
  let ssmClient: SSM;

  beforeAll(async () => {
    container = await new LocalstackContainer(LOCALSTACK_IMAGE).start();
    endpoint = container.getConnectionUri();
    ssmClient = new SSM({
      endpoint,
    });
    await ssmClient.send(
      new PutParameterCommand({
        Name: PARAM_NAME,
        Value: PARAM_VALUE,
        Type: 'SecureString',
      }),
    );
  }, 60000);

  afterAll(async () => {
    await container.stop();
  });

  it('Should_ReturnSecretValue_When_ParameterExists', async () => {
    // Arrange
    const sut = new AwsSsmSecretProvider(ssmClient);

    // Act
    const actual = await sut.getSecret(PARAM_NAME);

    // Assert
    expect(actual).toBe(PARAM_VALUE);
  });
});
