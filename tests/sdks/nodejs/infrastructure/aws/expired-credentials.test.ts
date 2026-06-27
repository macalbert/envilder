import type { SSMClient } from '@aws-sdk/client-ssm';
import { describe, expect, it, vi } from 'vitest';
import { ExpiredCredentialsError } from '../../../../../src/sdks/nodejs/src/domain/expired-credentials-error.js';
import { SsoSessionExpiredError } from '../../../../../src/sdks/nodejs/src/domain/sso-session-expired-error.js';
import { AwsSsmSecretProvider } from '../../../../../src/sdks/nodejs/src/infrastructure/aws/aws-ssm-secret-provider.js';

describe('AwsSsmSecretProvider expired credentials', () => {
  it('Should_ThrowExpiredCredentialsError_When_SendRejectsWithExpiredTokenException', async () => {
    // Arrange
    const send = vi.fn();
    const client = { send } as unknown as SSMClient;
    send.mockRejectedValue(
      Object.assign(
        new Error('The security token included in the request is expired'),
        { name: 'ExpiredTokenException' },
      ),
    );
    const sut = new AwsSsmSecretProvider(client);

    // Act
    const act = sut.getSecrets(['/a']);

    // Assert
    await expect(act).rejects.toThrow(ExpiredCredentialsError);
    await expect(act).rejects.toThrow('aws sso login');
  });

  it('Should_ThrowSsoSessionExpiredError_When_TokenProviderErrorIndicatesExpiredSso', async () => {
    // Arrange
    const send = vi.fn();
    const client = { send } as unknown as SSMClient;
    send.mockRejectedValue(
      Object.assign(new Error('Token is expired and refresh failed'), {
        name: 'TokenProviderError',
      }),
    );
    const sut = new AwsSsmSecretProvider(client, 'staging');

    // Act
    const act = sut.getSecrets(['/a']);

    // Assert
    await expect(act).rejects.toThrow(SsoSessionExpiredError);
    await expect(act).rejects.toMatchObject({ profileName: 'staging' });
  });

  it('Should_RethrowOriginalError_When_ErrorIsNotCredentialRelated', async () => {
    // Arrange
    const send = vi.fn();
    const client = { send } as unknown as SSMClient;
    send.mockRejectedValue(
      Object.assign(new Error('Parameter boom'), {
        name: 'InternalServerError',
      }),
    );
    const sut = new AwsSsmSecretProvider(client);

    // Act
    const act = sut.getSecrets(['/a']);

    // Assert
    await expect(act).rejects.toThrow('Parameter boom');
    await expect(act).rejects.not.toBeInstanceOf(ExpiredCredentialsError);
  });
});
