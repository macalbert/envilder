import type { SSMClient } from '@aws-sdk/client-ssm';
import { describe, expect, it, vi } from 'vitest';
import { AwsSsmSecretProvider } from '../../../../../src/sdks/nodejs/src/infrastructure/aws/aws-ssm-secret-provider.js';

const asSsmClient = (send: unknown) => ({ send }) as unknown as SSMClient;

describe('AwsSsmSecretProvider', () => {
  it('Should_ReturnValues_When_ParametersExist', async () => {
    // Arrange
    const mockSend = vi.fn().mockResolvedValue({
      Parameters: [
        { Name: '/app/db-url', Value: 'postgres://localhost' },
        { Name: '/app/api-key', Value: 'sk-123' },
      ],
      InvalidParameters: [],
    });
    const mockClient = asSsmClient(mockSend);
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets(['/app/db-url', '/app/api-key']);

    // Assert
    expect(actual.get('/app/db-url')).toBe('postgres://localhost');
    expect(actual.get('/app/api-key')).toBe('sk-123');
    expect(actual.size).toBe(2);
  });

  it('Should_OmitMissing_When_ParametersNotFound', async () => {
    // Arrange
    const mockSend = vi.fn().mockResolvedValue({
      Parameters: [{ Name: '/app/db-url', Value: 'postgres://localhost' }],
      InvalidParameters: ['/app/missing'],
    });
    const mockClient = asSsmClient(mockSend);
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets(['/app/db-url', '/app/missing']);

    // Assert
    expect(actual.get('/app/db-url')).toBe('postgres://localhost');
    expect(actual.has('/app/missing')).toBe(false);
    expect(actual.size).toBe(1);
  });

  it('Should_ReturnEmptyMap_When_NamesIsEmpty', async () => {
    // Arrange
    const mockSend = vi.fn();
    const mockClient = asSsmClient(mockSend);
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets([]);

    // Assert
    expect(actual.size).toBe(0);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('Should_BatchRequests_When_MoreThanTenNames', async () => {
    // Arrange
    const names = Array.from({ length: 12 }, (_, i) => `/app/key-${i}`);
    const mockSend = vi.fn().mockResolvedValue({
      Parameters: [],
      InvalidParameters: [],
    });
    const mockClient = asSsmClient(mockSend);
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    await sut.getSecrets(names);

    // Assert
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('Should_ThrowError_When_SsmClientIsNull', () => {
    // Act
    const act = () => new AwsSsmSecretProvider(null as unknown as SSMClient);

    // Assert
    expect(act).toThrow('ssmClient cannot be null');
  });

  it('Should_ThrowError_When_AnyNameIsEmpty', async () => {
    // Arrange
    const mockClient = asSsmClient(vi.fn());
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const act = sut.getSecrets(['/app/valid', '']);

    // Assert
    await expect(act).rejects.toThrow(
      'Secret name cannot be null or whitespace',
    );
  });

  it('Should_RethrowError_When_UnexpectedSsmError', async () => {
    // Arrange
    const error = new Error('AccessDenied');
    error.name = 'AccessDenied';
    const mockSend = vi.fn().mockRejectedValue(error);
    const mockClient = asSsmClient(mockSend);
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const act = sut.getSecrets(['/app/db-url']);

    // Assert
    await expect(act).rejects.toThrow('AccessDenied');
  });

  describe('checkSecretsExist', () => {
    function awsError(name: string, message = `${name} raised`): Error {
      return Object.assign(new Error(message), { name });
    }

    it('Should_ReportExistsAndMissingWithoutDecryption_When_CheckingNames', async () => {
      // Arrange
      const mockSend = vi.fn().mockResolvedValue({
        Parameters: [{ Name: '/app/db', Value: 'must-not-be-read' }],
        InvalidParameters: ['/app/missing'],
      });
      const sut = new AwsSsmSecretProvider(asSsmClient(mockSend));

      // Act
      const actual = await sut.checkSecretsExist(['/app/db', '/app/missing']);

      // Assert
      expect(actual).toEqual(
        new Map([
          ['/app/db', { status: 'exists' }],
          ['/app/missing', { status: 'missing' }],
        ]),
      );
      expect(mockSend.mock.calls[0][0].input).toEqual({
        Names: ['/app/db', '/app/missing'],
        WithDecryption: false,
      });
      expect(JSON.stringify([...actual])).not.toContain('must-not-be-read');
    });

    it('Should_BatchByTen_When_CheckingMoreThanTenDistinctNames', async () => {
      // Arrange
      const names = Array.from({ length: 12 }, (_, i) => `/app/key-${i}`);
      const mockSend = vi.fn().mockResolvedValue({ InvalidParameters: [] });
      const sut = new AwsSsmSecretProvider(asSsmClient(mockSend));

      // Act
      const actual = await sut.checkSecretsExist([...names, '/app/key-0']);

      // Assert
      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(mockSend.mock.calls[0][0].input.Names).toHaveLength(10);
      expect(mockSend.mock.calls[1][0].input.Names).toHaveLength(2);
      expect(actual.size).toBe(12);
    });

    it('Should_CheckEachNameAlone_When_BatchIsDeniedForOneName', async () => {
      // Arrange
      const mockSend = vi.fn().mockImplementation(async (command) => {
        if (command.input.Names.includes('/app/denied')) {
          throw awsError('AccessDeniedException');
        }
        return { InvalidParameters: [] };
      });
      const sut = new AwsSsmSecretProvider(asSsmClient(mockSend));

      // Act
      const actual = await sut.checkSecretsExist(['/app/db', '/app/denied']);

      // Assert
      expect(actual.get('/app/db')).toEqual({ status: 'exists' });
      expect(actual.get('/app/denied')).toEqual({
        status: 'access_denied',
        reason: 'AccessDeniedException raised',
      });
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it.each([
      ['UnrecognizedClientException', 'authentication_failed'],
      ['CredentialsProviderError', 'authentication_failed'],
      ['InvalidSignatureException', 'authentication_failed'],
      ['ThrottlingException', 'provider_error'],
    ])(
      'Should_MapErrorToStatus_When_ProviderThrows%s',
      async (name, status) => {
        // Arrange
        const mockSend = vi.fn().mockRejectedValue(awsError(name));
        const sut = new AwsSsmSecretProvider(asSsmClient(mockSend));

        // Act
        const actual = await sut.checkSecretsExist(['/app/a', '/app/b']);

        // Assert
        expect(actual.get('/app/a')?.status).toBe(status);
        expect(actual.get('/app/b')?.status).toBe(status);
      },
    );

    it('Should_ReportAuthenticationFailedWithRemediation_When_SsoSessionExpired', async () => {
      // Arrange
      const mockSend = vi
        .fn()
        .mockRejectedValue(awsError('TokenProviderError', 'expired'));
      const sut = new AwsSsmSecretProvider(asSsmClient(mockSend), 'dev');

      // Act
      const actual = await sut.checkSecretsExist(['/app/a']);

      // Assert
      expect(actual.get('/app/a')?.status).toBe('authentication_failed');
      expect(actual.get('/app/a')?.reason).toContain(
        'aws sso login --profile dev',
      );
    });

    it('Should_ReportAuthenticationFailed_When_TokenExpired', async () => {
      // Arrange
      const mockSend = vi.fn().mockRejectedValue(awsError('ExpiredToken'));
      const sut = new AwsSsmSecretProvider(asSsmClient(mockSend));

      // Act
      const actual = await sut.checkSecretsExist(['/app/a']);

      // Assert
      expect(actual.get('/app/a')?.status).toBe('authentication_failed');
    });
  });
});
