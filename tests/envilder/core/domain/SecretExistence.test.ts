import { describe, expect, it } from 'vitest';
import {
  describeSecretExistenceStatus,
  type RemoteKeyCheck,
  summarizeFailures,
} from '../../../../src/envilder/core/domain/SecretExistence';

function check(status: RemoteKeyCheck['status']): RemoteKeyCheck {
  return { variable: 'DB_URL', path: '/app/db-url', status };
}

describe('SecretExistence', () => {
  it('Should_CountFailuresByStatus_When_SomeChecksFail', () => {
    // Arrange
    const checks = [
      check('exists'),
      check('missing'),
      check('provider_error'),
      check('missing'),
      check('access_denied'),
      check('authentication_failed'),
    ];

    // Act
    const actual = summarizeFailures(checks);

    // Assert
    expect(actual).toBe(
      '2 missing, 1 access denied, 1 authentication failed, 1 provider error',
    );
  });

  it('Should_ReturnEmptySummary_When_EverySecretExists', () => {
    // Arrange
    const checks = [check('exists'), check('exists')];

    // Act
    const actual = summarizeFailures(checks);

    // Assert
    expect(actual).toBe('');
  });

  it('Should_DescribeStatusWithSpaces_When_StatusHasUnderscores', () => {
    // Act
    const actual = describeSecretExistenceStatus('authentication_failed');

    // Assert
    expect(actual).toBe('authentication failed');
  });
});
