import { describe, expect, it } from 'vitest';
import {
  toValidationJson,
  type ValidationResults,
} from '../../../../../src/envilder/apps/cli/validate/ValidationJsonReport';
import { ExpiredCredentialsError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';

function aCompleteRun(): ValidationResults {
  return {
    offline: false,
    mapFile: { path: 'envilder.json', violations: [] },
    keys: {
      provider: 'aws',
      checks: [
        { variable: 'DB_URL', path: '/app/db', status: 'exists' },
        { variable: 'API_KEY', path: '/app/api', status: 'missing' },
        {
          variable: 'TOKEN',
          path: '/app/token',
          status: 'access_denied',
          reason: 'not authorized to perform ssm:GetParameters',
        },
        {
          variable: 'SECRET',
          path: '/app/secret',
          status: 'authentication_failed',
        },
        {
          variable: 'QUEUE_URL',
          path: '/app/queue',
          status: 'provider_error',
          reason: 'connect ETIMEDOUT',
        },
      ],
    },
    envFile: {
      path: '.env',
      comparison: {
        present: ['DB_URL', 'API_KEY'],
        missing: ['TOKEN'],
        undeclared: ['ASPNETCORE_ENVIRONMENT'],
        duplicates: [{ key: 'DB_URL', count: 2 }],
      },
    },
    values: [{ variable: 'DB_URL', path: '/app/db', status: 'differs' }],
  };
}

describe('toValidationJson', () => {
  it('Should_MatchDocumentedShape_When_EveryStepRan', () => {
    // Arrange
    const results = aCompleteRun();

    // Act
    const actual = toValidationJson(results);

    // Assert
    expect(actual).toMatchSnapshot();
  });

  it('Should_ReportValid_When_EveryCheckPasses', () => {
    // Arrange
    const results: ValidationResults = {
      offline: false,
      mapFile: { path: 'envilder.json', violations: [] },
      keys: {
        provider: 'azure',
        checks: [{ variable: 'DB_URL', path: 'db-url', status: 'exists' }],
      },
      envFile: {
        path: '.env',
        comparison: {
          present: ['DB_URL'],
          missing: [],
          undeclared: ['EXTRA'],
          duplicates: [],
        },
      },
      values: [{ variable: 'DB_URL', path: 'db-url', status: 'matches' }],
    };

    // Act
    const actual = toValidationJson(results);

    // Assert
    expect(actual.valid).toBe(true);
    expect(actual.envFile?.valid).toBe(true);
  });

  it('Should_OmitSectionsThatDidNotRun_When_RunIsOffline', () => {
    // Arrange
    const results: ValidationResults = {
      offline: true,
      mapFile: { path: 'envilder.json', violations: [] },
    };

    // Act
    const actual = toValidationJson(results);

    // Assert
    expect(actual).toStrictEqual({
      valid: true,
      offline: true,
      mapFile: { path: 'envilder.json', valid: true, errors: [] },
    });
  });

  it('Should_ReportMapFileErrors_When_MapFileIsInvalid', () => {
    // Arrange
    const results: ValidationResults = {
      offline: false,
      mapFile: {
        path: 'envilder.json',
        violations: [{ key: 'PORT', message: 'PORT must map to a string.' }],
      },
    };

    // Act
    const actual = toValidationJson(results);

    // Assert
    expect(actual.valid).toBe(false);
    expect(actual.mapFile).toEqual({
      path: 'envilder.json',
      valid: false,
      errors: [{ key: 'PORT', message: 'PORT must map to a string.' }],
    });
    expect(actual).not.toHaveProperty('keys');
  });

  it('Should_ReportError_When_RunStoppedBeforeTheChecks', () => {
    // Arrange
    const results: ValidationResults = {
      offline: false,
      mapFile: { path: 'envilder.json', violations: [] },
    };

    // Act
    const actual = toValidationJson(results, new ExpiredCredentialsError());

    // Assert
    expect(actual.valid).toBe(false);
    expect(actual.error?.message).toContain('AWS credentials are expired');
  });
});
