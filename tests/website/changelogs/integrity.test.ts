import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  changelogToHtml,
  extractVersions,
} from '../../../src/website/src/utils/markdown';

const changelogDir = resolve(__dirname, '../../../docs/changelogs');

const changelogs = [
  { name: 'CLI', file: 'cli.md' },
  { name: 'GHA', file: 'gha.md' },
  { name: 'SDK .NET', file: 'sdk-dotnet.md' },
  { name: 'SDK Python', file: 'sdk-python.md' },
  { name: 'SDK Node.js', file: 'sdk-nodejs.md' },
] as const;

describe('Changelog integrity', () => {
  describe.each(changelogs)('$name ($file)', ({ name, file }) => {
    const md = readFileSync(resolve(changelogDir, file), 'utf-8');
    const versions = extractVersions(md);

    it('Should_ExtractAtLeastOneVersion_When_ChangelogFileIsParsed', () => {
      // Arrange — md loaded above

      // Act
      const result = versions;

      // Assert
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should_HaveValidSemverTags_When_VersionsAreExtracted', () => {
      // Arrange
      const semverPattern = /^v\d+\.\d+\.\d+$/;

      // Act
      const invalidTags = versions.filter((v) => !semverPattern.test(v.tag));

      // Assert
      expect(invalidTags).toEqual([]);
    });

    it('Should_HaveValidIsoDates_When_VersionsHaveDates', () => {
      // Arrange
      const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
      const datedVersions = versions.filter((v) => v.date !== '');

      // Act
      const invalidDates = datedVersions.filter(
        (v) => !isoDatePattern.test(v.date),
      );

      // Assert
      expect(invalidDates).toEqual([]);
    });

    it('Should_ProduceHtmlWithoutRawMarkdown_When_ChangelogIsConverted', () => {
      // Arrange — md loaded above

      // Act
      const html = changelogToHtml(md);

      // Assert
      expect(html).not.toMatch(/^## /m);
      expect(html).not.toMatch(/^### /m);
      expect(html).not.toMatch(/^[*-] /m);
      expect(html).not.toContain('<!--');
    });

    it('Should_ContainVersionAnchors_When_HtmlIsGenerated', () => {
      // Arrange
      const html = changelogToHtml(md);

      // Act
      const anchorIds = versions.map((v) => v.id);

      // Assert
      for (const id of anchorIds) {
        expect(html).toContain(`id="${id}"`);
      }
    });
  });
});
