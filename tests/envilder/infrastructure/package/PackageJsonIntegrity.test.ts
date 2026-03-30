import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

describe('PackageJsonIntegrity', () => {
  let pkg: Record<string, unknown>;

  beforeAll(async () => {
    const rootDir = join(__dirname, '..', '..', '..', '..');
    const raw = await readFile(join(rootDir, 'package.json'), 'utf-8');
    pkg = JSON.parse(raw);
  });

  it('Should_NotContainCatalogProtocol_When_DependenciesAreResolved', () => {
    // Arrange
    const deps: Record<string, string> =
      (pkg.dependencies as Record<string, string>) ?? {};

    // Act
    const catalogEntries = Object.entries(deps).filter(
      ([, value]) => typeof value === 'string' && value.includes('catalog:'),
    );

    // Assert
    expect(
      catalogEntries,
      `Found catalog: protocol in: ${catalogEntries.map(([k]) => k).join(', ')}`,
    ).toHaveLength(0);
  });

  it('Should_NotHaveTypesNodeInDependencies_When_PackageJsonIsPublished', () => {
    // Arrange
    const deps = (pkg.dependencies as Record<string, string>) ?? {};

    // Act
    const hasTypesNode = Object.hasOwn(deps, '@types/node');

    // Assert
    expect(
      hasTypesNode,
      '@types/node should not be in dependencies — it is a types-only devDependency',
    ).toBe(false);
  });
});
