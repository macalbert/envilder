import { describe, expect, it } from 'vitest';
import { toAzureSecretName } from '../../../../../src/sdks/nodejs/src/infrastructure/azure/azure-secret-name.js';

// The same cases are pinned in the CLI, Python and .NET tests: every surface
// must resolve a map-file reference to the same Key Vault secret.
describe('toAzureSecretName', () => {
  it.each([
    'MY-SECRET-NAME',
    'Database--Password',
    '1password-token',
    '-edge-hyphens-',
    'a'.repeat(127),
  ])('Should_KeepNameAsWritten_When_NameIsValidForAzure (%s)', (name) => {
    // Act
    const actual = toAzureSecretName(name);

    // Assert
    expect(actual).toBe(name);
  });

  it.each([
    ['/myapp/db_password', 'myapp-db-password'],
    ['/MY/SECRET_NAME', 'my-secret-name'],
    ['db__url', 'db-url'],
    ['/123/test', 'secret-123-test'],
    ['/', 'secret'],
  ])(
    'Should_NormalizeLikeTheCli_When_NameIsInvalidForAzure (%s)',
    (name, expected) => {
      // Act
      const actual = toAzureSecretName(name);

      // Assert
      expect(actual).toBe(expected);
    },
  );

  it.each(['db.url', 'db url', 'db:url'])(
    'Should_Throw_When_NameHasCharactersAzureCannotHold (%s)',
    (name) => {
      // Act
      const action = () => toAzureSecretName(name);

      // Assert
      expect(action).toThrow(/not allowed by Azure Key Vault/);
    },
  );

  it('Should_Throw_When_NormalizedNameExceedsLimit', () => {
    // Arrange
    const name = `${'a'.repeat(127)}_x`;

    // Act
    const action = () => toAzureSecretName(name);

    // Assert
    expect(action).toThrow(/127-character limit/);
  });
});
