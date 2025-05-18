import { spawn, execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

describe('envilder CLI (E2E)', () => {
  beforeAll(() => {
    uninstallGlobalEnvilder();

    // Install dependencies, build, and pack/install CLI globally
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    execSync('node scripts/pack-and-install.js', { cwd: rootDir, stdio: 'inherit' });
  }, 120_000);

  const envilder = 'envilder';
  const expectedVersion = pkg.version;
  const testEnvFile = join(rootDir, 'tests', 'sample', 'cli-validation.env');
  const paramMapPath = join(rootDir, 'tests', 'sample', 'param-map.json');

  afterAll(() => {
    uninstallGlobalEnvilder();
  });

  it('Should_PrintCorrectVersion_When_VersionFlagIsProvided', async () => {
    // Arrange
    const argument = '--version';

    // Act
    const actual = await runCommand(envilder, [argument]);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output.trim()).toBe(expectedVersion);
  });

  it('Should_PrintHelpWithExpectedOptions_When_HelpFlagIsProvided', async () => {
    // Arrange
    const argument = '--help';

    // Act
    const actual = await runCommand(envilder, [argument]);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output).toContain('--map');
    expect(actual.output).toContain('--envfile');
  });

  it('Should_GenerateEnvironmentFile_When_ValidArgumentsAreProvided', async () => {
    // Arrange
    const arguments_ = ['--map', paramMapPath, '--envfile', testEnvFile];

    // Act
    const actual = await runCommand(envilder, arguments_);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output).toContain('Environment File generated');
    expect(existsSync(testEnvFile)).toBe(true);
  });

  it('Should_FailWithInvalidArguments_When_InvalidArgumentsAreProvided', async () => {
    // Arrange
    const arguments_ = ['--invalid'];

    // Act
    const actual = await runCommand(envilder, arguments_);

    // Assert
    expect(actual.code).not.toBe(0);
  });

  it('Should_Fail_When_RequiredOptionsAreMissing', async () => {
    // Arrange
    const arguments_ = [];

    // Act
    const actual = await runCommand(envilder, arguments_);

    // Assert
    expect(actual.code).not.toBe(0);
  });
});

function runCommand(command: string, args: string[]): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { shell: true });
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    proc.on('close', (code) => {
      resolve({ code: code ?? 0, output });
    });
  });
}

function uninstallGlobalEnvilder() {
  try {
    execSync('npm uninstall -g envilder', { stdio: 'inherit' });
  } catch (e) {
    // Ignore errors if not installed
  }
}
