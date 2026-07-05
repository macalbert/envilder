import { randomUUID } from 'node:crypto';
import {
  GetParameterCommand,
  PutParameterCommand,
  SSM,
} from '@aws-sdk/client-ssm';
import { STS } from '@aws-sdk/client-sts';
import {
  LocalstackContainer,
  type StartedLocalStackContainer,
} from '@testcontainers/localstack';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  ExpiredCredentialsError,
  SecretOperationError,
  SsoSessionExpiredError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { AwsSsmSecretProvider } from '../../../../../src/envilder/core/infrastructure/aws/AwsSsmSecretProvider';

// Constants for integration tests
const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
const PARAM_NAME = '/test/secret';
const PARAM_VALUE = 'super-secret-value';
const NON_EXISTENT_PARAM = '/test/non-existent-param';

const stripAnsi = (value: string): string =>
  value.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g'), '');

// Unit tests with mocks
describe('AwsSsmSecretProvider (unit tests)', () => {
  let mockSendFn: ReturnType<typeof vi.fn>;
  let mockStsSendFn: ReturnType<typeof vi.fn>;
  let mockRegionFn: ReturnType<typeof vi.fn>;
  let mockCredentialsFn: ReturnType<typeof vi.fn>;
  let mockSts: STS;
  let mockLogger: {
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };
  let mockSsm: SSM;
  let sut: AwsSsmSecretProvider;

  beforeEach(() => {
    mockSendFn = vi.fn();
    mockRegionFn = vi.fn().mockResolvedValue('us-east-1');
    mockCredentialsFn = vi.fn().mockResolvedValue({
      accountId: '123456789012',
    });
    mockSsm = {
      send: mockSendFn,
      config: { region: mockRegionFn, credentials: mockCredentialsFn },
    } as unknown as SSM;
    mockStsSendFn = vi.fn();
    mockSts = { send: mockStsSendFn } as unknown as STS;
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts);
  });

  describe('getSecret', () => {
    it('Should_ReturnValue_When_ParameterExists', async () => {
      // Arrange
      const expectedValue = 'test-secret-value';
      mockSendFn.mockResolvedValueOnce({
        Parameter: { Value: expectedValue },
      });

      // Act
      const actual = await sut.getSecret('test-param');

      // Assert
      expect(mockSendFn).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: 'test-param',
            WithDecryption: true,
          },
        }),
      );
      expect(actual).toBe(expectedValue);
    });

    it('Should_ReturnUndefined_When_ParameterNotFound', async () => {
      // Arrange
      const error = new Error('Parameter not found');
      error.name = 'ParameterNotFound';
      mockSendFn.mockRejectedValueOnce(error);

      // Act
      const result = await sut.getSecret('non-existent-param');

      // Assert
      expect(result).toBeUndefined();
    });

    it('Should_ThrowError_When_OtherErrorOccurs', async () => {
      // Arrange
      const error = new Error('Network error');
      mockSendFn.mockRejectedValueOnce(error);

      // Act
      const thrown = await sut.getSecret('test-param').catch((e: unknown) => e);

      // Assert
      expect((thrown as Error).message).toBe('Network error');
    });

    it('Should_HandleNonErrorObject_When_ErrorIsThrown', async () => {
      // Arrange
      mockSendFn.mockRejectedValueOnce('String error');

      // Act
      const thrown = await sut.getSecret('test-param').catch((e: unknown) => e);

      // Assert
      expect((thrown as Error).message).toBe('String error');
    });

    it('Should_ThrowExpiredCredentialsError_When_GetSecretFailsWithExpiredToken', async () => {
      // Arrange
      mockSendFn.mockRejectedValueOnce(
        Object.assign(
          new Error('The security token included in the request is expired'),
          { name: 'ExpiredTokenException' },
        ),
      );

      // Act
      const error = await sut.getSecret('/p').catch((e: unknown) => e);

      // Assert
      expect(error).toBeInstanceOf(ExpiredCredentialsError);
      expect((error as Error).message).toContain('aws sso login');
    });

    it('Should_ThrowSsoSessionExpiredError_When_GetSecretFailsWithTokenProviderError', async () => {
      // Arrange
      sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts, 'developer');
      mockSendFn.mockRejectedValueOnce(
        Object.assign(new Error('SSO session is expired'), {
          name: 'TokenProviderError',
        }),
      );

      // Act
      const error = await sut.getSecret('/p').catch((e: unknown) => e);

      // Assert
      expect(error).toBeInstanceOf(SsoSessionExpiredError);
      expect((error as SsoSessionExpiredError).profileName).toBe('developer');
    });

    it('Should_StillThrowSecretOperationError_When_NonCredentialErrorOccurs', async () => {
      // Arrange
      mockSendFn.mockRejectedValueOnce(
        Object.assign(new Error('boom'), { name: 'InternalServerError' }),
      );

      // Act
      const action = () => sut.getSecret('/p');

      // Assert
      await expect(action()).rejects.toThrow(SecretOperationError);
    });
  });

  describe('setSecret', () => {
    it('Should_CallSsmSend_When_SettingSecret', async () => {
      // Arrange
      mockSendFn.mockResolvedValueOnce({});

      // Act
      await sut.setSecret('test-param', 'test-value');

      // Assert
      expect(mockSendFn).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: 'test-param',
            Value: 'test-value',
            Type: 'SecureString',
            Overwrite: true,
          },
        }),
      );
    });

    it('Should_PropagateError_When_SetSecretFails', async () => {
      // Arrange
      const error = new Error('Access denied');
      mockSendFn.mockRejectedValueOnce(error);

      // Act
      const action = () => sut.setSecret('test-param', 'test-value');

      // Assert
      await expect(action()).rejects.toThrow('Access denied');
    });

    it('Should_ThrowExpiredCredentialsError_When_SetSecretFailsWithExpiredToken', async () => {
      // Arrange
      mockSendFn.mockRejectedValueOnce(
        Object.assign(
          new Error('The security token included in the request is expired'),
          { name: 'ExpiredTokenException' },
        ),
      );

      // Act
      const action = () => sut.setSecret('/p', 'v');

      // Assert
      await expect(action()).rejects.toThrow(ExpiredCredentialsError);
    });

    it('Should_ThrowSsoSessionExpiredError_When_SetSecretFailsWithTokenProviderError', async () => {
      // Arrange
      sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts, 'developer');
      mockSendFn.mockRejectedValueOnce(
        Object.assign(new Error('sso token could not be loaded'), {
          name: 'TokenProviderError',
        }),
      );

      // Act
      const action = () => sut.setSecret('/p', 'v');

      // Assert
      await expect(action()).rejects.toThrow(SsoSessionExpiredError);
    });
  });

  describe('identity logging', () => {
    it('Should_LogAccountRegionProfile_When_FirstSecretRead', async () => {
      // Arrange
      sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts, 'developer');
      mockRegionFn.mockResolvedValue('us-east-1');
      mockCredentialsFn.mockResolvedValue({ accountId: '123456789012' });
      mockSendFn.mockResolvedValue({ Parameter: { Value: 'v' } });

      // Act
      await sut.getSecret('x');

      // Assert
      const logged = stripAnsi(vi.mocked(mockLogger.info).mock.calls[0][0]);
      expect(logged).toBe(
        '☁ AWS identity · account=123456789012 · region=us-east-1 · profile=developer',
      );
    });

    it('Should_LogAccountFromSts_When_AccountIdMissing', async () => {
      // Arrange
      sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts, 'developer');
      mockCredentialsFn.mockResolvedValueOnce({});
      mockStsSendFn.mockResolvedValue({ Account: '999999999999' });
      mockSendFn.mockResolvedValue({ Parameter: { Value: 'v' } });

      // Act
      await sut.getSecret('x');

      // Assert
      const logged = stripAnsi(vi.mocked(mockLogger.info).mock.calls[0][0]);
      expect(logged).toBe(
        '☁ AWS identity · account=999999999999 · region=us-east-1 · profile=developer',
      );
    });

    it('Should_LogUnknownAccount_When_CredentialsAndStsFail', async () => {
      // Arrange
      sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts, 'developer');
      mockCredentialsFn.mockRejectedValueOnce(new Error('no creds'));
      mockStsSendFn.mockRejectedValue(new Error('sts down'));
      mockSendFn.mockResolvedValue({ Parameter: { Value: 'v' } });

      // Act
      await sut.getSecret('x');

      // Assert
      const logged = stripAnsi(vi.mocked(mockLogger.info).mock.calls[0][0]);
      expect(logged).toBe(
        '☁ AWS identity · account=unknown · region=us-east-1 · profile=developer',
      );
    });

    it('Should_LogIdentityOnlyOnce_When_MultipleSecretsRead', async () => {
      // Arrange
      sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts, 'developer');
      mockSendFn.mockResolvedValue({ Parameter: { Value: 'v' } });

      // Act
      await sut.getSecret('a');
      await sut.getSecret('b');

      // Assert
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it('Should_DefaultProfile_When_NoProfileProvided', async () => {
      // Arrange
      sut = new AwsSsmSecretProvider(mockSsm, mockLogger, mockSts);
      mockSendFn.mockResolvedValue({ Parameter: { Value: 'v' } });

      // Act
      await sut.getSecret('x');

      // Assert
      const logged = stripAnsi(vi.mocked(mockLogger.info).mock.calls[0][0]);
      expect(logged).toBe(
        '☁ AWS identity · account=123456789012 · region=us-east-1 · profile=default',
      );
    });
  });
});

// Integration tests with LocalStack — requires Docker
describe('AwsSsmSecretProvider (integration with LocalStack)', () => {
  let container: StartedLocalStackContainer;
  let endpoint: string;
  let ssmClient: SSM;
  let stsClient: STS;
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

  beforeAll(async () => {
    if (!process.env.LOCALSTACK_AUTH_TOKEN) {
      throw new Error(
        'LOCALSTACK_AUTH_TOKEN is required. Run `pnpx envilder` to populate .env',
      );
    }
    container = await new LocalstackContainer(LOCALSTACK_IMAGE)
      .withName(`localstack-ssm-${randomUUID().slice(0, 8)}`)
      .withEnvironment({
        LOCALSTACK_AUTH_TOKEN: process.env.LOCALSTACK_AUTH_TOKEN,
      })
      .start();
    endpoint = container.getConnectionUri();
    ssmClient = new SSM({
      endpoint,
    });
    stsClient = new STS({
      endpoint,
    });
    await ssmClient.send(
      new PutParameterCommand({
        Name: PARAM_NAME,
        Value: PARAM_VALUE,
        Type: 'SecureString',
      }),
    );
  }, 60_000);

  afterAll(async () => {
    await container.stop();
  });

  it('Should_ReturnSecretValue_When_ParameterExists', async () => {
    // Arrange
    const sut = new AwsSsmSecretProvider(ssmClient, mockLogger, stsClient);

    // Act
    const actual = await sut.getSecret(PARAM_NAME);

    // Assert
    expect(actual).toBe(PARAM_VALUE);
  });

  it('Should_ReturnUndefined_When_ParameterDoesNotExist', async () => {
    // Arrange
    const sut = new AwsSsmSecretProvider(ssmClient, mockLogger, stsClient);

    // Act
    const actual = await sut.getSecret(NON_EXISTENT_PARAM);

    // Assert
    expect(actual).toBeUndefined();
  });

  it('Should_StoreSecretValue_When_SetSecretIsCalled', async () => {
    // Arrange
    const sut = new AwsSsmSecretProvider(ssmClient, mockLogger, stsClient);
    const paramName = '/test/new-secret';
    const paramValue = 'new-secret-value';

    // Act
    await sut.setSecret(paramName, paramValue);

    // Assert
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true,
    });
    const response = await ssmClient.send(command);
    expect(response.Parameter?.Value).toBe(paramValue);
  });

  it('Should_UpdateSecretValue_When_SecretAlreadyExists', async () => {
    // Arrange
    const sut = new AwsSsmSecretProvider(ssmClient, mockLogger, stsClient);
    const paramName = '/test/update-secret';
    const initialValue = 'initial-value';
    const updatedValue = 'updated-value';

    // Setup initial value
    await ssmClient.send(
      new PutParameterCommand({
        Name: paramName,
        Value: initialValue,
        Type: 'SecureString',
      }),
    );

    // Act
    await sut.setSecret(paramName, updatedValue);

    // Assert
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true,
    });
    const response = await ssmClient.send(command);
    expect(response.Parameter?.Value).toBe(updatedValue);
  });
});
