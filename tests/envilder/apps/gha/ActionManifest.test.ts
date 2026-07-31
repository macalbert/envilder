import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(process.cwd());
const subdirectoryActionPath = resolve(
  repositoryRoot,
  'github-action',
  'action.yml',
);
const marketplaceActionPath = resolve(repositoryRoot, 'action.yml');

describe('GitHub Action manifest', () => {
  it('Should_MatchSubdirectoryManifest_When_MarketplaceActionIsBuilt', () => {
    // Arrange
    const subdirectoryManifest = readFileSync(subdirectoryActionPath, 'utf-8');
    const githubActionPath = '$' + '{{ github.action_path }}';
    const expected = subdirectoryManifest.replace(
      `${githubActionPath}/dist/index.js`,
      `${githubActionPath}/github-action/dist/index.js`,
    );

    // Act
    const actual = readFileSync(marketplaceActionPath, 'utf-8');

    // Assert
    expect(actual).toBe(expected);
  });
});
