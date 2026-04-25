import { describe, expect, it, vi } from 'vitest';
import { AwsSsmSecretProvider } from '../../../../../src/sdks/typescript/src/infrastructure/aws/aws-ssm-secret-provider.js';

describe('AwsSsmSecretProvider', () => {
  it('Should_ReturnValue_When_ParameterExists', async () => {
    // Arrange
    const mockSend = vi.fn().mockResolvedValue({
      Parameter: { Value: 'my-secret-value' },
    });
    const mockClient = { send: mockSend };
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecret('/app/db-url');

    // Assert
    expect(actual).toBe('my-secret-value');
  });

  it('Should_ReturnNull_When_ParameterNotFound', async () => {
    // Arrange
    const error = new Error('ParameterNotFound');
    error.name = 'ParameterNotFound';
    const mockSend = vi.fn().mockRejectedValue(error);
    const mockClient = { send: mockSend };
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const actual = await sut.getSecret('/app/missing');

    // Assert
    expect(actual).toBeNull();
  });

  it('Should_ThrowError_When_SsmClientIsNull', () => {
    // Act
    const act = () => new AwsSsmSecretProvider(null);

    // Assert
    expect(act).toThrow('ssmClient cannot be null');
  });

  it('Should_ThrowError_When_NameIsEmpty', async () => {
    // Arrange
    const mockClient = { send: vi.fn() };
    const sut = new AwsSsmSecretProvider(mockClient);

    // Act
    const act = sut.getSecret('');

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
    const act = sut.getSecret('/app/db-url');

    // Assert
    await expect(act).rejects.toThrow('AccessDenied');
  });
});
