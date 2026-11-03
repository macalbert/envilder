import { describe, expect, it } from 'vitest';
import {
  compareEnvFileKeys,
  summarizeEnvFileFailures,
  summarizeValueFailures,
} from '../../../../src/envilder/core/domain/EnvFileComparison';

describe('compareEnvFileKeys', () => {
  it('Should_ListDeclaredKeyAsMissing_When_EnvFileLacksIt', () => {
    // Arrange
    const declared = ['DB_URL', 'API_KEY'];
    const entries = [{ key: 'DB_URL', value: 'local' }];

    // Act
    const actual = compareEnvFileKeys(declared, entries);

    // Assert
    expect(actual.missing).toEqual(['API_KEY']);
  });

  it('Should_ListKeyAsUndeclared_When_OnlyTheEnvFileHasIt', () => {
    // Arrange
    const declared = ['DB_URL'];
    const entries = [
      { key: 'DB_URL', value: 'local' },
      { key: 'DEBUG', value: 'true' },
    ];

    // Act
    const actual = compareEnvFileKeys(declared, entries);

    // Assert
    expect(actual.undeclared).toEqual(['DEBUG']);
  });

  it('Should_CountEmptyAssignmentAsPresent_When_ValueIsEmpty', () => {
    // Arrange
    const declared = ['API_KEY'];
    const entries = [{ key: 'API_KEY', value: '' }];

    // Act
    const actual = compareEnvFileKeys(declared, entries);

    // Assert
    expect(actual).toEqual({
      present: ['API_KEY'],
      missing: [],
      undeclared: [],
      duplicates: [],
    });
  });

  it('Should_ListDuplicateOnceWithItsCount_When_KeyAppearsSeveralTimes', () => {
    // Arrange
    const declared = ['API_KEY'];
    const entries = [
      { key: 'API_KEY', value: 'a' },
      { key: 'EXTRA', value: '1' },
      { key: 'API_KEY', value: 'b' },
      { key: 'EXTRA', value: '2' },
      { key: 'API_KEY', value: 'c' },
    ];

    // Act
    const actual = compareEnvFileKeys(declared, entries);

    // Assert
    expect(actual.duplicates).toEqual([
      { key: 'API_KEY', count: 3 },
      { key: 'EXTRA', count: 2 },
    ]);
  });

  it('Should_TreatKeysAsCaseSensitive_When_CaseDiffers', () => {
    // Arrange
    const declared = ['API_KEY'];
    const entries = [{ key: 'api_key', value: 'x' }];

    // Act
    const actual = compareEnvFileKeys(declared, entries);

    // Assert
    expect(actual).toEqual({
      present: [],
      missing: ['API_KEY'],
      undeclared: ['api_key'],
      duplicates: [],
    });
  });
});

describe('summarizeEnvFileFailures', () => {
  it('Should_CountMissingAndDuplicatedKeys_When_BothFail', () => {
    // Arrange
    const comparison = {
      present: [],
      missing: ['A', 'B'],
      undeclared: ['C'],
      duplicates: [{ key: 'D', count: 2 }],
    };

    // Act
    const actual = summarizeEnvFileFailures(comparison, '.env');

    // Assert
    expect(actual).toBe('2 missing from .env, 1 duplicated in .env');
  });

  it('Should_ReturnEmpty_When_OnlyUndeclaredKeysExist', () => {
    // Arrange
    const comparison = {
      present: ['A'],
      missing: [],
      undeclared: ['C'],
      duplicates: [],
    };

    // Act
    const actual = summarizeEnvFileFailures(comparison, '.env');

    // Assert
    expect(actual).toBe('');
  });
});

describe('summarizeValueFailures', () => {
  it('Should_CountDiffersAndUnreadable_When_BothOccur', () => {
    // Arrange
    const checks = [
      { variable: 'A', path: '/a', status: 'matches' as const },
      { variable: 'B', path: '/b', status: 'differs' as const },
      { variable: 'C', path: '/c', status: 'differs' as const },
      {
        variable: 'D',
        path: '/d',
        status: 'unreadable' as const,
        reason: 'not found',
      },
    ];

    // Act
    const actual = summarizeValueFailures(checks);

    // Assert
    expect(actual).toBe('2 differ, 1 unreadable');
  });

  it('Should_UseSingularVerb_When_OneValueDiffers', () => {
    // Arrange
    const checks = [{ variable: 'B', path: '/b', status: 'differs' as const }];

    // Act
    const actual = summarizeValueFailures(checks);

    // Assert
    expect(actual).toBe('1 differs');
  });
});
