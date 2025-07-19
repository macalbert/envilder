import { access, mkdir, rmdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { PackageVersionReader } from '../../../../src/envilder/infrastructure/package/PackageVersionReader';

describe('PackageVersionReader', () => {
  const tempDir = join(__dirname, 'temp-pkgjson-test');
  const packageJsonPath = join(tempDir, 'package.json');
  const sut = new PackageVersionReader();

  beforeEach(async () => {
    try {
      await access(tempDir);
    } catch {
      await mkdir(tempDir);
    }
  });

  afterAll(async () => {
    try {
      await unlink(packageJsonPath);
    } catch {}
    try {
      await rmdir(tempDir);
    } catch {}
  });

  it('Should_ReturnVersion_When_PackageJsonIsValid', async () => {
    // Arrange
    await writeFile(packageJsonPath, JSON.stringify({ version: '1.2.3' }));

    // Act
    const actual = await sut.getVersion(packageJsonPath);

    // Assert
    expect(actual).toBe('1.2.3');
  });

  it('Should_Throw_When_PackageJsonDoesNotExist', async () => {
    // Arrange
    const nonExistentPath = join(tempDir, 'non-existent-package.json');

    // Act
    const action = async () => await sut.getVersion(nonExistentPath);

    //  Assert
    await expect(action()).rejects.toThrow('package.json not found');
  });

  it('Should_Throw_When_VersionFieldIsMissing', async () => {
    // Arrange
    await writeFile(packageJsonPath, JSON.stringify({ name: 'test' }));

    // Act
    const action = async () => await sut.getVersion(packageJsonPath);

    // Assert
    await expect(action()).rejects.toThrow(
      'Version field not found in package.json',
    );
  });

  it('Should_Throw_When_PackageJsonIsInvalid', async () => {
    // Arrange
    await writeFile(packageJsonPath, '{ version"=: }');

    // Act
    const action = async () => await sut.getVersion(packageJsonPath);

    // Assert
    await expect(action()).rejects.toThrow(
      'Failed to read or parse package.json',
    );
  });
});
