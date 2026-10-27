import { describe, expect, it } from 'vitest';
import { toAzureSecretName } from '../../../../../src/sdks/nodejs/src/infrastructure/azure/azure-secret-name.js';

// The same cases are pinned in the CLI, Python and .NET tests: every surface
// must send Key Vault the same secret name.
describe('toAzureSecretName', () => {
  it.each([
    'MY-SECRET-NAME',
    'Database--Password',
    '1password-token',
    'my_secret_name',
    'db.url',
  ])('Should_PassNameAsWritten_When_NameHasNoSlash (%s)', (name) => {
    // Act
    const actual = toAzureSecretName(name);

    // Assert
    expect(actual).toBe(name);
  });

  it.each([
    ['/myapp/db/password', 'myapp-db-password'],
    ['myapp/db_password', 'myapp-db_password'],
    ['/MyApp/Db', 'MyApp-Db'],
    ['//a//b', 'a--b'],
  ])(
    'Should_TurnSlashesIntoHyphens_When_NameHasSlashes (%s)',
    (name, expected) => {
      // Act
      const actual = toAzureSecretName(name);

      // Assert
      expect(actual).toBe(expected);
    },
  );
});
