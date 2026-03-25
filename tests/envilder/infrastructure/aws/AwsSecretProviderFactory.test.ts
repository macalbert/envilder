import { describe, expect, it, vi } from 'vitest';

vi.mock('@aws-sdk/client-ssm', () => {
  const SSM = vi.fn();
  return { SSM };
});

vi.mock('@aws-sdk/credential-providers', () => {
  const fromIni = vi.fn(() => ({
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
  }));
  return { fromIni };
});

import { SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { createAwsSecretProvider } from '../../../../src/envilder/infrastructure/aws/AwsSecretProviderFactory.js';

describe('createAwsSecretProvider', () => {
  it('Should_ReturnAwsProvider_When_ProfileProvided', () => {
    // Arrange
    const config = { provider: 'aws', profile: 'myprofile' };

    // Act
    const actual = createAwsSecretProvider(config);

    // Assert
    expect(actual).toBeDefined();
    expect(fromIni).toHaveBeenCalledWith({ profile: 'myprofile' });
  });

  it('Should_ReturnAwsProvider_When_NoProfileProvided', () => {
    // Arrange
    const config = { provider: 'aws' };
    vi.mocked(fromIni).mockClear();

    // Act
    const actual = createAwsSecretProvider(config);

    // Assert
    expect(actual).toBeDefined();
    expect(fromIni).not.toHaveBeenCalled();
  });
});
