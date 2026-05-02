import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractVersions } from '../../../src/website/src/utils/markdown';

const root = resolve(__dirname, '../../..');
const changelogDir = resolve(root, 'docs/changelogs');

function readVersion(file: string): string {
  return readFileSync(resolve(root, file), 'utf-8');
}

function latestChangelogVersion(file: string): string {
  const md = readFileSync(resolve(changelogDir, file), 'utf-8');
  const versions = extractVersions(md);
  return versions[0]?.tag ?? '';
}

describe('Version consistency', () => {
  it('Should_MatchRootPackageVersion_When_CliChangelogIsParsed', () => {
    // Arrange
    const pkg = JSON.parse(readVersion('package.json'));
    const expected = `v${pkg.version}`;

    // Act
    const actual = latestChangelogVersion('cli.md');

    // Assert
    expect(actual).toBe(expected);
  });

  it('Should_MatchCsprojVersion_When_DotnetChangelogIsParsed', () => {
    // Arrange
    const csproj = readVersion('src/sdks/dotnet/Envilder.csproj');
    const match = csproj.match(/<Version>(.*?)<\/Version>/);
    expect(
      match,
      'Failed to parse <Version> from Envilder.csproj',
    ).not.toBeNull();
    const expected = `v${match?.[1]}`;

    // Act
    const actual = latestChangelogVersion('sdk-dotnet.md');

    // Assert
    expect(actual).toBe(expected);
  });

  it('Should_MatchPyprojectVersion_When_PythonChangelogIsParsed', () => {
    // Arrange
    const toml = readVersion('src/sdks/python/pyproject.toml');
    const match = toml.match(/^version\s*=\s*"(.*?)"/m);
    expect(match, 'Failed to parse version from pyproject.toml').not.toBeNull();
    const expected = `v${match?.[1]}`;

    // Act
    const actual = latestChangelogVersion('sdk-python.md');

    // Assert
    expect(actual).toBe(expected);
  });

  it('Should_MatchNodejsPackageVersion_When_NodejsChangelogIsParsed', () => {
    // Arrange
    const pkg = JSON.parse(readVersion('src/sdks/nodejs/package.json'));
    const expected = `v${pkg.version}`;

    // Act
    const actual = latestChangelogVersion('sdk-nodejs.md');

    // Assert
    expect(actual).toBe(expected);
  });

  it('Should_MatchRootPackageVersion_When_GhaChangelogIsParsed', () => {
    // Arrange
    const pkg = JSON.parse(readVersion('package.json'));
    const expected = `v${pkg.version}`;

    // Act
    const actual = latestChangelogVersion('gha.md');

    // Assert
    expect(actual).toBe(expected);
  });
});
