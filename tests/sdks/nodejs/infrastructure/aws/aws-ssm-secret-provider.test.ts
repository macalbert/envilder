import { describe, expect, it, vi } from 'vitest';
import { AwsSsmSecretProvider } from '../../../../../src/sdks/nodejs/src/infrastructure/aws/aws-ssm-secret-provider.js';

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
    const mockClient = { send: mockSend };
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
    const mockClient = { send: mockSend };
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
    const mockClient = { send: vi.fn() };
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecrets([]);

    // Assert
    expect(actual.size).toBe(0);
    expect(mockClient.send).not.toHaveBeenCalled();
  });

  it('Should_BatchRequests_When_MoreThanTenNames', async () => {
    // Arrange
    const names = Array.from({ length: 12 }, (_, i) => `/app/key-${i}`);
    const mockSend = vi.fn().mockResolvedValue({
      Parameters: [],
      InvalidParameters: [],
    });
    const mockClient = { send: mockSend };
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    await sut.getSecrets(names);

    // Assert
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('Should_ThrowError_When_SsmClientIsNull', () => {
    // Act
    const act = () => new AwsSsmSecretProvider(null);

    // Assert
    expect(act).toThrow('ssmClient cannot be null');
  });

  it('Should_ThrowError_When_AnyNameIsEmpty', async () => {
    // Arrange
    const mockClient = { send: vi.fn() };
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
    const mockClient = { send: mockSend };
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const act = sut.getSecrets(['/app/db-url']);

    // Assert
    await expect(act).rejects.toThrow('AccessDenied');
  });
});
