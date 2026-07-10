import { describe, expect, it } from 'vitest';
import { presentGhaError } from '../../../../../src/envilder/apps/gha/errors/GhaErrorPresenter';
import { SecretsFetchError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';

describe('GhaErrorPresenter', () => {
  it('Should_RenderFailureListWithReasons_When_SecretsFetchErrorIsGiven', () => {
    // Arrange
    const error = new SecretsFetchError([
      { envVar: 'DB_URL', path: '/app/db/url', reason: 'ParameterNotFound' },
      { envVar: 'API_KEY', path: '/app/api/key', reason: 'AccessDenied' },
    ]);

    // Act
    const actual = presentGhaError(error);

    // Assert
    expect(actual).toContain('  \u2717 DB_URL \u2192 /app/db/url');
    expect(actual).toContain('  \u2717 API_KEY \u2192 /app/api/key');
    expect(actual).toContain('   ParameterNotFound');
    expect(actual).toContain('   AccessDenied');
  });

  it('Should_DeduplicateReasons_When_MultipleFailuresShareTheSameReason', () => {
    // Arrange
    const error = new SecretsFetchError([
      { envVar: 'A', path: '/a', reason: 'ParameterNotFound' },
      { envVar: 'B', path: '/b', reason: 'ParameterNotFound' },
    ]);

    // Act
    const actual = presentGhaError(error);

    // Assert
    const reasonLines = actual.filter((line) =>
      line.includes('ParameterNotFound'),
    );
    expect(reasonLines).toHaveLength(1);
  });

  it('Should_RenderGenericGameOverMessage_When_ErrorIsUnknown', () => {
    // Arrange
    const error = new Error('Connection timeout');

    // Act
    const actual = presentGhaError(error);

    // Assert
    expect(actual.join('\n')).toContain('GAME OVER');
    expect(actual.join('\n')).not.toContain('Mario');
    expect(actual).toContain('Connection timeout');
  });

  it('Should_StringifyValue_When_ErrorIsNotAnErrorObject', () => {
    // Act
    const actual = presentGhaError('plain string failure');

    // Assert
    expect(actual).toContain('plain string failure');
  });
});
