import { describe, expect, it } from 'vitest';
import {
  changelogToHtml,
  extractVersions,
} from '../../../src/website/src/utils/markdown';

describe('extractVersions', () => {
  it('Should_ExtractVersionEntries_When_ChangelogHasVersionHeadings', () => {
    // Arrange
    const md = `# Changelog

## [0.9.0] - 2026-03-22

### Added
- New feature

## [0.8.0] - 2026-02-15

### Fixed
- Bug fix`;

    // Act
    const result = extractVersions(md);

    // Assert
    expect(result).toEqual([
      { tag: 'v0.9.0', id: 'v090', date: '2026-03-22' },
      { tag: 'v0.8.0', id: 'v080', date: '2026-02-15' },
    ]);
  });

  it('Should_ReturnEmptyArray_When_ChangelogHasNoVersions', () => {
    // Arrange
    const md = '# Changelog\n\nNo releases yet.';

    // Act
    const result = extractVersions(md);

    // Assert
    expect(result).toEqual([]);
  });
});

describe('changelogToHtml', () => {
  it('Should_StripHtmlComments_When_ChangelogContainsMarkdownlintDirectives', () => {
    // Arrange
    const md =
      '<!-- markdownlint-disable -->\n## [1.0.0] - 2026-01-01\n- Feature';

    // Act
    const result = changelogToHtml(md);

    // Assert
    expect(result).not.toContain('<!--');
    expect(result).not.toContain('-->');
  });

  it('Should_ConvertHeadingsAndLists_When_ChangelogHasStandardMarkdown', () => {
    // Arrange
    const md = `## [1.0.0] - 2026-01-01

### Added
- First feature
- Second feature`;

    // Act
    const result = changelogToHtml(md);

    // Assert
    expect(result).toContain('<h2 id="v100">');
    expect(result).toContain('<span class="version-tag">v1.0.0</span>');
    expect(result).toContain('<span class="release-date">2026-01-01</span>');
    expect(result).toContain('<h3>Added</h3>');
    expect(result).toContain('<li>First feature</li>');
    expect(result).toContain('<li>Second feature</li>');
    expect(result).toContain('<ul>');
  });

  it('Should_ConvertIndentedCodeFences_When_CodeBlockIsInsideListContinuation', () => {
    // Arrange
    const md = `## [0.9.3] - 2026-04-17

### Added

* **SDKs available** — no \`.env\` needed:

  **Python** ([PyPI](https://pypi.org/project/envilder)):

  \`\`\`python
  from envilder import Envilder
  Envilder.load('secrets-map.json')
  \`\`\`

### Changed

* **README rewritten** — Simplified quick start`;

    // Act
    const result = changelogToHtml(md);

    // Assert
    expect(result).toContain('<pre><code>');
    expect(result).toContain('from envilder import Envilder');
    expect(result).not.toContain('```python');
    expect(result).toContain('<h3>Changed</h3>');
    expect(result).toContain('<li><strong>README rewritten</strong>');
  });
});
