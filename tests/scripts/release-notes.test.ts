import { describe, expect, it } from 'vitest';
import {
  findPreviousTag,
  renderReleaseNotes,
} from '../../scripts/release-notes.mjs';

const changelog = `# CLI Changelog

Intro text.

---

## [0.19.0] - 2026-10-30

<!-- release
title: any Azure Key Vault host
summary: Azure Key Vault URLs now go to the Azure client as written,
in the CLI and the GitHub Action.
-->

### Changed

* **Azure Key Vault URLs are no longer checked by host**: The CLI rejected a
  \`vaultUrl\` that did not use \`https://\`. See the
  [Guide](../validate-command.md)

\`\`\`bash
envilder validate
  --offline
\`\`\`

### Security

* **Accepted risk**: credentials follow the vault URL

---

## [0.18.0] - 2026-10-29

### Added

* **\`envilder validate --offline\`**: a new subcommand
`;

const pullRequests = [
  '* feat(cli): accept any Azure Key Vault host by @macalbert in https://github.com/macalbert/envilder/pull/634',
];

describe('renderReleaseNotes', () => {
  it('Should_AppendReleaseTitle_When_SectionDeclaresIt', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.19.0',
      changelog,
      previousTag: 'v0.18.0',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.title).toBe(
      '🍄 Envilder level up v0.19.0: any Azure Key Vault host',
    );
  });

  it('Should_UseComponentTitleOnly_When_SectionHasNoReleaseComment', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.18.0',
      changelog,
      previousTag: 'v0.17.2',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.title).toBe('🍄 Envilder level up v0.18.0');
    expect(actual.body.startsWith('## ✨ Added')).toBe(true);
  });

  it('Should_StartWithUnwrappedSummary_When_ReleaseCommentDeclaresIt', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.19.0',
      changelog,
      previousTag: 'v0.18.0',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body.split('\n')[0]).toBe(
      'Azure Key Vault URLs now go to the Azure client as written, in the CLI and the GitHub Action.',
    );
    expect(actual.body).not.toContain('<!--');
  });

  it('Should_RenderChangelogHeadingsAsEmojiSections_When_SectionHasSubheadings', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.19.0',
      changelog,
      previousTag: 'v0.18.0',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body).toContain('\n## 🔄 Changed\n');
    expect(actual.body).toContain('\n## 🔒 Security\n');
    expect(actual.body).not.toContain('## [0.18.0]');
  });

  it('Should_JoinWrappedLinesAndKeepCodeBlocks_When_BulletSpansSeveralLines', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.19.0',
      changelog,
      previousTag: 'v0.18.0',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body).toContain(
      '- **Azure Key Vault URLs are no longer checked by host**: The CLI rejected a `vaultUrl` that did not use `https://`. See the [Guide](https://github.com/macalbert/envilder/blob/v0.19.0/docs/validate-command.md)\n',
    );
    expect(actual.body).toContain(
      '```bash\nenvilder validate\n  --offline\n```',
    );
  });

  it('Should_AddUpgradeDocsAndChangeList_When_RenderingCliRelease', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.19.0',
      changelog,
      previousTag: 'v0.18.0',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body).toContain('- uses: macalbert/envilder@v0.19.0');
    expect(actual.body).toContain('npm install -g envilder@0.19.0');
    expect(actual.body).toContain(
      'https://envilder.com/docs/getting-started/?utm_source=github&utm_medium=release&utm_campaign=v0.19.0',
    );
    expect(actual.body).toContain(
      `<details>\n<summary>All changes in this release</summary>\n\n${pullRequests[0]}\n\n</details>`,
    );
    expect(
      actual.body.endsWith(
        '**Full Changelog**: https://github.com/macalbert/envilder/compare/v0.18.0...v0.19.0\n',
      ),
    ).toBe(true);
  });

  it('Should_UseSdkTagAndInstallCommand_When_RenderingPythonRelease', () => {
    // Arrange
    const input = {
      component: 'sdk-python',
      version: '0.19.0',
      changelog,
      previousTag: 'sdk-python/v0.18.0',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.title).toBe(
      '🐍 Envilder Python SDK v0.19.0: any Azure Key Vault host',
    );
    expect(actual.body).toContain('pip install envilder==0.19.0');
    expect(actual.body).toContain(
      'https://envilder.com/docs/sdks/python/?utm_source=github&utm_medium=release&utm_campaign=sdk-python-v0.19.0',
    );
    expect(actual.body).toContain(
      'https://github.com/macalbert/envilder/blob/sdk-python/v0.19.0/docs/validate-command.md',
    );
    expect(actual.body).toContain(
      'compare/sdk-python/v0.18.0...sdk-python/v0.19.0',
    );
  });

  it('Should_NotCloseFence_When_FenceLikeLineIsIndentedFourOrMoreSpaces', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.18.0',
      changelog: `${changelog}\n~~~md\nenvilder validate\n    ~~~\nfirst\nsecond\n~~~\n`,
      previousTag: 'v0.17.2',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body).toContain(
      '~~~md\nenvilder validate\n    ~~~\nfirst\nsecond\n~~~',
    );
  });

  it('Should_KeepTildeFencedCodeIntact_When_SectionUsesTildeFence', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.18.0',
      changelog: `${changelog}\n~~~bash\nenvilder validate\n  --offline\n\`\`\`\n  --map=a.json\n~~~\n`,
      previousTag: 'v0.17.2',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body).toContain(
      '~~~bash\nenvilder validate\n  --offline\n```\n  --map=a.json\n~~~',
    );
  });

  it('Should_KeepTabIndentedFence_When_ListItemIndentsFenceWithTab', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.18.0',
      changelog: `${changelog}\n* Example:\n\n\t~~~sh\n\tfirst\n\tsecond\n\t~~~\n`,
      previousTag: 'v0.17.2',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body).toContain('\t~~~sh\n\tfirst\n\tsecond\n\t~~~');
  });

  it('Should_KeepEntriesAfterFence_When_FenceContainsSectionHeading', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.19.0',
      changelog: changelog.replace(
        '```bash\nenvilder validate',
        '```md\n## Example\n```\n\n```bash\nenvilder validate',
      ),
      previousTag: 'v0.18.0',
      pullRequests,
    };

    // Act
    const actual = renderReleaseNotes(input);

    // Assert
    expect(actual.body).toContain('## Example');
    expect(actual.body).toContain('Accepted risk');
  });

  it('Should_Throw_When_ChangelogHasNoSectionForVersion', () => {
    // Arrange
    const input = {
      component: 'cli',
      version: '0.20.0',
      changelog,
      previousTag: 'v0.19.0',
      pullRequests,
    };

    // Act
    const act = () => renderReleaseNotes(input);

    // Assert
    expect(act).toThrow('No "## [0.20.0]" section');
  });
});

describe('findPreviousTag', () => {
  it('Should_ReturnHighestLowerVersionOfSameComponent_When_TagsAreMixed', () => {
    // Arrange
    const tags = [
      'v0',
      'vv0.7.0',
      'v0.9.0',
      'v0.10.0',
      'v0.19.0',
      'sdk-python/v1.0.0',
      'v0.18.0-beta.1',
    ];

    // Act
    const actual = findPreviousTag(tags, 'cli', '0.19.0');

    // Assert
    expect(actual).toBe('v0.10.0');
  });

  it('Should_ReturnSdkTag_When_ComponentIsSdk', () => {
    // Arrange
    const tags = ['v0.17.0', 'sdk-nodejs/v0.4.2', 'sdk-nodejs/v0.4.10'];

    // Act
    const actual = findPreviousTag(tags, 'sdk-nodejs', '1.0.0');

    // Assert
    expect(actual).toBe('sdk-nodejs/v0.4.10');
  });

  it('Should_SkipPrereleaseTags_When_VersionIsStable', () => {
    // Arrange
    const tags = ['v0.19.0', 'v0.19.1-0', 'v0.19.1-1'];

    // Act
    const actual = findPreviousTag(tags, 'cli', '0.19.1');

    // Assert
    expect(actual).toBe('v0.19.0');
  });

  it('Should_ReturnPreviousPrerelease_When_VersionIsPrerelease', () => {
    // Arrange
    const tags = ['v0.19.0', 'v0.19.1-0', 'v0.19.1-1', 'v0.19.1-10'];

    // Act
    const actual = findPreviousTag(tags, 'cli', '0.19.1-2');

    // Assert
    expect(actual).toBe('v0.19.1-1');
  });

  it('Should_ReturnPreviousStableTag_When_FirstPrereleaseOfVersion', () => {
    // Arrange
    const tags = ['v0.18.0', 'v0.19.0'];

    // Act
    const actual = findPreviousTag(tags, 'cli', '0.19.1-0');

    // Assert
    expect(actual).toBe('v0.19.0');
  });
});
