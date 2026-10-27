import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { EOL, tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InvalidArgumentError } from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { GitHubEnvFileExporter } from '../../../../../src/envilder/core/infrastructure/github/GitHubEnvFileExporter';

/**
 * Parses a GITHUB_ENV file the way the runner does: `NAME=value` lines and
 * `NAME<<DELIMITER` blocks closed by a line equal to the delimiter.
 */
function parseGitHubEnvFile(content: string): Record<string, string> {
  const lines = content.split(EOL);
  const variables: Record<string, string> = {};
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line === '') {
      continue;
    }
    const heredoc = line.indexOf('<<');
    if (heredoc === -1) {
      const equals = line.indexOf('=');
      variables[line.slice(0, equals)] = line.slice(equals + 1);
      continue;
    }
    const name = line.slice(0, heredoc);
    const delimiter = line.slice(heredoc + 2);
    const valueLines: string[] = [];
    index++;
    while (lines[index] !== delimiter) {
      if (index >= lines.length) {
        throw new Error(`Unterminated block for ${name}`);
      }
      valueLines.push(lines[index]);
      index++;
    }
    variables[name] = valueLines.join(EOL);
  }
  return variables;
}

describe('GitHubEnvFileExporter', () => {
  let directory: string;
  let filePath: string;
  let originalGitHubEnv: string | undefined;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'envilder-github-env-'));
    filePath = join(directory, 'github_env');
    await writeFile(filePath, '');
    originalGitHubEnv = process.env.GITHUB_ENV;
  });

  afterEach(async () => {
    if (originalGitHubEnv === undefined) {
      delete process.env.GITHUB_ENV;
    } else {
      process.env.GITHUB_ENV = originalGitHubEnv;
    }
    await rm(directory, { recursive: true, force: true });
  });

  it('Should_WriteEveryVariable_When_Exporting', async () => {
    // Arrange
    const sut = new GitHubEnvFileExporter({ filePath });

    // Act
    await sut.export({ DB_PASSWORD: 'fake-pass', API_KEY: 'fake-key' });

    // Assert
    const actual = parseGitHubEnvFile(await readFile(filePath, 'utf8'));
    expect(actual).toEqual({ DB_PASSWORD: 'fake-pass', API_KEY: 'fake-key' });
  });

  it('Should_KeepMultilineValueAsOneVariable_When_ValueTriesToDeclareAnother', async () => {
    // Arrange
    const sut = new GitHubEnvFileExporter({ filePath });
    const value = `line-1${EOL}EOF${EOL}INJECTED=yes${EOL}line-4`;

    // Act
    await sut.export({ CERTIFICATE: value });

    // Assert
    const actual = parseGitHubEnvFile(await readFile(filePath, 'utf8'));
    expect(actual).toEqual({ CERTIFICATE: value });
  });

  it('Should_AppendToExistingContent_When_FileAlreadyHasVariables', async () => {
    // Arrange
    await writeFile(filePath, `EARLIER=value${EOL}`);
    const sut = new GitHubEnvFileExporter({ filePath });

    // Act
    await sut.export({ API_KEY: 'fake-key' });

    // Assert
    const actual = parseGitHubEnvFile(await readFile(filePath, 'utf8'));
    expect(actual).toEqual({ EARLIER: 'value', API_KEY: 'fake-key' });
  });

  it('Should_UseGitHubEnvVariable_When_NoFilePathIsGiven', async () => {
    // Arrange
    process.env.GITHUB_ENV = filePath;
    const sut = new GitHubEnvFileExporter();

    // Act
    await sut.export({ API_KEY: 'fake-key' });

    // Assert
    const actual = parseGitHubEnvFile(await readFile(filePath, 'utf8'));
    expect(actual).toEqual({ API_KEY: 'fake-key' });
  });

  it('Should_ThrowInvalidArgumentError_When_GitHubEnvIsNotSet', async () => {
    // Arrange
    delete process.env.GITHUB_ENV;
    const sut = new GitHubEnvFileExporter();

    // Act
    const actual = await sut
      .export({ API_KEY: 'fake-key' })
      .catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect((actual as Error).message).toContain('GITHUB_ENV is not set');
    expect((actual as Error).message).not.toContain('fake-key');
  });
});
