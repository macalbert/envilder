import { describe, expect, it } from 'vitest';
import { ca } from '../../../src/website/src/i18n/ca';
import { en } from '../../../src/website/src/i18n/en';
import { es } from '../../../src/website/src/i18n/es';

function extractKeys(obj: unknown, prefix = ''): string[] {
  const keys: string[] = [];
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        keys.push(...extractKeys(value, path));
      } else if (Array.isArray(value)) {
        keys.push(`${path}[length:${value.length}]`);
      } else {
        keys.push(path);
      }
    }
  }
  return keys;
}

describe('i18n completeness', () => {
  const enKeys = extractKeys(en);
  const caKeys = extractKeys(ca);
  const esKeys = extractKeys(es);

  it('Should_HaveNonZeroKeys_When_EnglishLocaleIsLoaded', () => {
    // Act
    const actual = enKeys.length;

    // Assert
    expect(actual).toBeGreaterThan(0);
  });

  it('Should_HaveNoMissingKeys_When_CatalanComparedToEnglish', () => {
    // Act
    const actual = enKeys.filter((k) => !caKeys.includes(k));

    // Assert
    expect(actual, 'Keys missing in ca.ts').toEqual([]);
  });

  it('Should_HaveNoExtraKeys_When_CatalanComparedToEnglish', () => {
    // Act
    const actual = caKeys.filter((k) => !enKeys.includes(k));

    // Assert
    expect(actual, 'Extra keys in ca.ts not in en.ts').toEqual([]);
  });

  it('Should_HaveNoMissingKeys_When_SpanishComparedToEnglish', () => {
    // Act
    const actual = enKeys.filter((k) => !esKeys.includes(k));

    // Assert
    expect(actual, 'Keys missing in es.ts').toEqual([]);
  });

  it('Should_HaveNoExtraKeys_When_SpanishComparedToEnglish', () => {
    // Act
    const actual = esKeys.filter((k) => !enKeys.includes(k));

    // Assert
    expect(actual, 'Extra keys in es.ts not in en.ts').toEqual([]);
  });
});
