import { afterEach, describe, expect, it, vi } from 'vitest';
import { GitHubActionsSecretMasker } from '../../../../../src/envilder/core/infrastructure/github/GitHubActionsSecretMasker';

describe('GitHubActionsSecretMasker', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Should_EmitEscapedMaskCommand_When_SecretIsRegistered', () => {
    // Arrange
    const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    const sut = new GitHubActionsSecretMasker();

    // Act
    sut.mask('secret%value\r\nnext');

    // Assert
    expect(write).toHaveBeenCalledWith(
      '::add-mask::secret%25value%0D%0Anext\n',
    );
  });
});
