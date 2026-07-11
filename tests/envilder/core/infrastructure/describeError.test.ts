import { describe, expect, it } from 'vitest';
import { describeError } from '../../../../src/envilder/core/infrastructure/describeError';

describe('describeError', () => {
  it('Should_ReturnMessage_When_ErrorHasMessage', () => {
    // Arrange
    const error = new Error('Network error');

    // Act
    const actual = describeError(error);

    // Assert
    expect(actual).toBe('Network error');
  });

  it('Should_DigIntoInnerErrors_When_AggregateErrorHasEmptyMessage', () => {
    // Arrange
    const error = new AggregateError(
      [new Error('connect ECONNREFUSED 127.0.0.1:9999')],
      '',
    );

    // Act
    const actual = describeError(error);

    // Assert
    expect(actual).toBe('connect ECONNREFUSED 127.0.0.1:9999');
  });

  it('Should_DeduplicateReasons_When_InnerErrorsRepeat', () => {
    // Arrange
    const error = new AggregateError(
      [new Error('timeout'), new Error('timeout')],
      '',
    );

    // Act
    const actual = describeError(error);

    // Assert
    expect(actual).toBe('timeout');
  });

  it('Should_FollowCause_When_ErrorMessageIsEmpty', () => {
    // Arrange
    const error = new Error('', { cause: new Error('root cause') });

    // Act
    const actual = describeError(error);

    // Assert
    expect(actual).toBe('root cause');
  });

  it('Should_ReturnFallback_When_NoReasonAvailable', () => {
    // Act
    const actual = describeError('');

    // Assert
    expect(actual).toBe('unknown error');
  });

  it('Should_StringifyValue_When_ErrorIsNotAnErrorObject', () => {
    // Act
    const actual = describeError('plain string failure');

    // Assert
    expect(actual).toBe('plain string failure');
  });
});
