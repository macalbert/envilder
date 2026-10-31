import { describe, expect, it } from 'vitest';
import { findAdditionsToReleasedSections } from '../../scripts/check-released-changelogs.mjs';

const base = `# CLI Changelog

## [0.19.0] - 2026-10-30

### Changed

* **Azure Key Vault URLs are no longer checked by host**

---

## [0.18.0] - 2026-10-29

### Added

* **\`envilder validate --offline\`**
* **Removed later**
`;

describe('findAdditionsToReleasedSections', () => {
  it('Should_ReportAddedLines_When_TaggedSectionGainsAnEntry', () => {
    // Arrange
    const head = base.replace(
      '### Changed\n',
      '### Added\n\n* **`envilder validate` checks that every secret exists**\n\n### Changed\n',
    );

    // Act
    const actual = findAdditionsToReleasedSections({
      base,
      head,
      tags: ['v0.18.0', 'v0.19.0'],
      tagPrefix: 'v',
    });

    // Assert
    expect(actual).toEqual([
      {
        version: '0.19.0',
        lines: [
          '### Added',
          '* **`envilder validate` checks that every secret exists**',
        ],
      },
    ]);
  });

  it('Should_IgnoreSection_When_VersionIsNotTagged', () => {
    // Arrange
    const head = base.replace(
      '# CLI Changelog\n',
      '# CLI Changelog\n\n## [0.20.0] - 2026-11-01\n\n### Added\n\n* **New entry**\n\n---\n',
    );

    // Act
    const actual = findAdditionsToReleasedSections({
      base,
      head,
      tags: ['v0.18.0', 'v0.19.0'],
      tagPrefix: 'v',
    });

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_IgnoreRemovals_When_LinesAreDeletedFromTaggedSection', () => {
    // Arrange
    const head = base.replace('* **Removed later**\n', '');

    // Act
    const actual = findAdditionsToReleasedSections({
      base,
      head,
      tags: ['v0.18.0', 'v0.19.0'],
      tagPrefix: 'v',
    });

    // Assert
    expect(actual).toEqual([]);
  });

  it('Should_OnlyMatchOwnTags_When_OtherComponentsShareTheVersion', () => {
    // Arrange
    const head = base.replace(
      '### Changed\n',
      '### Changed\n\n* **Added after release**\n',
    );

    // Act
    const actual = findAdditionsToReleasedSections({
      base,
      head,
      tags: ['v0.19.0', 'sdk-nodejs/v0.19.0'],
      tagPrefix: 'sdk-python/v',
    });

    // Assert
    expect(actual).toEqual([]);
  });
});
