import {
  GetParameterCommand,
  PutParameterCommand,
  SSM,
} from '@aws-sdk/client-ssm';
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
import { AwsSsmSecretProvider } from '../../../../src/envilder/infrastructure/Aws/AwsSsmSecretProvider';

// Constants for integration tests
const LOCALSTACK_IMAGE = 'localstack/localstack:stable';
const PARAM_NAME = '/test/secret';
const PARAM_VALUE = 'super-secret-value';
const NON_EXISTENT_PARAM = '/test/non-existent-param';

// Unit tests with mocks
describe('AwsSsmSecretProvider (unit tests)', () => {
  let mockSendFn: ReturnType<typeof vi.fn>;
  let mockSsm: SSM;
  let sut: AwsSsmSecretProvider;

  beforeEach(() => {
    mockSendFn = vi.fn();
    mockSsm = {
      send: mockSendFn,
    } as unknown as SSM;
    sut = new AwsSsmSecretProvider(mockSsm);
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
      const action = () => sut.getSecret('test-param');

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to get secret test-param: Network error',
      );
    });

    it('Should_HandleNonErrorObject_When_ErrorIsThrown', async () => {
      // Arrange
      mockSendFn.mockRejectedValueOnce('String error');

      // Act
      const action = () => sut.getSecret('test-param');

      // Assert
      await expect(action()).rejects.toThrow(
        'Failed to get secret test-param: String error',
      );
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
      await expect(action()).rejects.toThrow(
        'Access denied',
      );
    });
  });
});

// Integration tests with LocalStack
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

  it('Should_ReturnUndefined_When_ParameterDoesNotExist', async () => {
    // Arrange
    const sut = new AwsSsmSecretProvider(ssmClient);

    // Act
    const actual = await sut.getSecret(NON_EXISTENT_PARAM);

    // Assert
    expect(actual).toBeUndefined();
  });

  it('Should_StoreSecretValue_When_SetSecretIsCalled', async () => {
    // Arrange
    const sut = new AwsSsmSecretProvider(ssmClient);
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
    const sut = new AwsSsmSecretProvider(ssmClient);
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
