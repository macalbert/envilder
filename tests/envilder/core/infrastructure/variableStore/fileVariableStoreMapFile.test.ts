import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvironmentFileError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import {
  decideMapFileUpdate,
  type MapFileUpdateDecision,
} from '../../../../../src/envilder/core/domain/MapFileUpdate';
import { ConsoleLogger } from '../../../../../src/envilder/core/infrastructure/logger/ConsoleLogger';
import { FileVariableStore } from '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore';

function contentOf(decision: MapFileUpdateDecision): string {
  if (decision.kind !== 'create' && decision.kind !== 'append') {
    throw new Error(`Unexpected decision: ${decision.kind}`);
  }
  return decision.content;
}

describe('FileVariableStore map file persistence', () => {
  let tempDir: string;
  let sut: FileVariableStore;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envilder-map-file-'));
    sut = new FileVariableStore(new ConsoleLogger());
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('Should_ReturnNull_When_MapFileDoesNotExist', async () => {
    // Arrange
    const path = join(tempDir, 'missing.json');

    // Act
    const actual = await sut.readMapFileContent(path);

    // Assert
    expect(actual).toBeNull();
  });

  it('Should_ReturnRawContent_When_MapFileExists', async () => {
    // Arrange
    const path = join(tempDir, 'envilder.json');
    const raw = '{\r\n\t"A": "/a"\r\n}';
    await writeFile(path, raw);

    // Act
    const actual = await sut.readMapFileContent(path);

    // Assert
    expect(actual).toBe(raw);
  });

  it('Should_ThrowEnvironmentFileError_When_MapFilePathIsADirectory', async () => {
    // Arrange
    const path = tempDir;

    // Act
    const action = () => sut.readMapFileContent(path);

    // Assert
    await expect(action()).rejects.toThrow(EnvironmentFileError);
  });

  it('Should_CreateFile_When_WritingNewMapFile', async () => {
    // Arrange
    const path = join(tempDir, 'envilder.json');
    const content = '{\n  "A": "/a"\n}\n';

    // Act
    await sut.writeMapFileContent(path, content);

    // Assert
    expect(await readFile(path, 'utf-8')).toBe(content);
  });

  it('Should_ThrowEnvironmentFileErrorWithoutCreatingDirectory_When_ParentDirectoryIsMissing', async () => {
    // Arrange
    const path = join(tempDir, 'missing-dir', 'envilder.json');

    // Act
    const action = () => sut.writeMapFileContent(path, '{}');

    // Assert
    await expect(action()).rejects.toThrow(EnvironmentFileError);
    expect(existsSync(join(tempDir, 'missing-dir'))).toBe(false);
  });

  it('Should_RemoveFile_When_RestoringMapFileThatDidNotExist', async () => {
    // Arrange
    const path = join(tempDir, 'envilder.json');
    await writeFile(path, '{}');

    // Act
    await sut.restoreMapFile(path, null);

    // Assert
    expect(existsSync(path)).toBe(false);
  });

  it('Should_NotThrow_When_RestoringMissingMapFileThatDidNotExist', async () => {
    // Arrange
    const path = join(tempDir, 'missing.json');

    // Act
    const action = () => sut.restoreMapFile(path, null);

    // Assert
    await expect(action()).resolves.toBeUndefined();
  });

  it('Should_WriteOriginalContent_When_RestoringMapFileThatExisted', async () => {
    // Arrange
    const path = join(tempDir, 'envilder.json');
    const original = '{\r\n    "OTHER": "/other"\r\n}';
    await writeFile(path, '{"OTHER": "/other", "API_KEY": "/k"}');

    // Act
    await sut.restoreMapFile(path, original);

    // Assert
    expect(await readFile(path, 'utf-8')).toBe(original);
  });

  it('Should_PersistCreatedFileExactly_When_DecisionIsCreate', async () => {
    // Arrange
    const path = join(tempDir, 'envilder.json');
    const decision = decideMapFileUpdate(
      await sut.readMapFileContent(path),
      'API_KEY',
      '/envilder/demo/api-key',
      { provider: 'aws' },
      path,
    );
    const content = contentOf(decision);

    // Act
    await sut.writeMapFileContent(path, content);

    // Assert
    expect(await readFile(path, 'utf-8')).toBe(
      '{\n  "API_KEY": "/envilder/demo/api-key"\n}\n',
    );
  });

  it('Should_PreserveFourSpaceIndentAndCrlf_When_AppendingToExistingFile', async () => {
    // Arrange
    const path = join(tempDir, 'envilder.json');
    await writeFile(path, '{\r\n    "A": "/a"\r\n}\r\n');
    const decision = decideMapFileUpdate(
      await sut.readMapFileContent(path),
      'API_KEY',
      '/k',
      { provider: 'aws' },
      path,
    );
    const content = contentOf(decision);

    // Act
    await sut.writeMapFileContent(path, content);

    // Assert
    expect(await readFile(path, 'utf-8')).toBe(
      '{\r\n    "A": "/a",\r\n    "API_KEY": "/k"\r\n}\r\n',
    );
  });

  it('Should_PreserveTabsAndMissingTrailingNewline_When_AppendingToExistingFile', async () => {
    // Arrange
    const path = join(tempDir, 'envilder.json');
    await writeFile(path, '{\n\t"A": "/a"\n}');
    const decision = decideMapFileUpdate(
      await sut.readMapFileContent(path),
      'API_KEY',
      '/k',
      { provider: 'aws' },
      path,
    );
    const content = contentOf(decision);

    // Act
    await sut.writeMapFileContent(path, content);

    // Assert
    expect(await readFile(path, 'utf-8')).toBe(
      '{\n\t"A": "/a",\n\t"API_KEY": "/k"\n}',
    );
  });
});
