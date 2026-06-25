import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { describe, expect, it, vi } from 'vitest';
import { createAwsSecretProvider } from '../../../../../src/envilder/core/infrastructure/aws/AwsSecretProviderFactory.js';

vi.mock('@aws-sdk/client-ssm', () => {
  const SSM = vi.fn();
  return { SSM };
});

vi.mock('@aws-sdk/credential-providers', () => {
  const fromNodeProviderChain = vi.fn(() => ({
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
  }));
  return { fromNodeProviderChain };
});

describe('createAwsSecretProvider', () => {
  it('Should_ReturnAwsProvider_When_NoProfileProvided', () => {
    // Arrange
    const config = { provider: 'aws' };
    vi.mocked(fromNodeProviderChain).mockClear();

    // Act
    const actual = createAwsSecretProvider(config);

    // Assert
    expect(actual).toBeDefined();
    expect(fromNodeProviderChain).not.toHaveBeenCalled();
  });

  it('Should_UseSsoCapableCredentialChain_When_ProfileProvided', () => {
    // Arrange
    vi.mocked(fromNodeProviderChain).mockClear();
    const config = { provider: 'aws', profile: 'myprofile' };

    // Act
    const actual = createAwsSecretProvider(config);

    // Assert
    expect(actual).toBeDefined();
    expect(fromNodeProviderChain).toHaveBeenCalledWith({
      profile: 'myprofile',
    });
    expect(fromNodeProviderChain).toHaveBeenCalledTimes(1);
  });
});
