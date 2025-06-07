import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

describe('Envilder CLI (E2E)', () => {
  beforeAll(() => {
    cleanUpSystem();
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    execSync('node --loader ts-node/esm scripts/pack-and-install.ts', {
      cwd: rootDir,
      stdio: 'inherit',
    });
  }, 120_000);

  const envilder = 'envilder';
  const testEnvFile = join(
    rootDir,
    'tests',
    'cli',
    'sample',
    'cli-validation.env',
  );
  const paramMapPath = join(
    rootDir,
    'tests',
    'cli',
    'sample',
    'param-map.json',
  );

  afterAll(() => {
    cleanUpSystem();
  });

  it('Should_PrintCorrectVersion_When_VersionFlagIsProvided', async () => {
    // Arrange
    const params = ['--version'];
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    const expectedVersion = pkg.version;

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output.trim()).toBe(expectedVersion);
  });

  it('Should_PrintHelpWithExpectedOptions_When_HelpFlagIsProvided', async () => {
    // Arrange
    const params = ['--help'];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output).toContain('--map');
    expect(actual.output).toContain('--envfile');
  });

  it('Should_GenerateEnvironmentFile_When_ValidArgumentsAreProvided', async () => {
    // Arrange
    const params = ['--map', paramMapPath, '--envfile', testEnvFile];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).toBe(0);
    expect(actual.output).toContain('Environment File generated');
    expect(existsSync(testEnvFile)).toBe(true);
  });

  it('Should_FailWithInvalidArguments_When_InvalidArgumentsAreProvided', async () => {
    // Arrange
    const params = ['--invalid'];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).not.toBe(0);
    expect(actual.output).toContain('error');
  });

  it('Should_Fail_When_RequiredOptionsAreMissing', async () => {
    // Arrange
    const params: string[] = [];

    // Act
    const actual = await runCommand(envilder, params);

    // Assert
    expect(actual.code).not.toBe(0);
    expect(actual.output).toContain('error:');
  });
});

function runCommand(
  command: string,
  args: string[],
): Promise<{ code: number; output: string }> {
  console.log(
    `${pc.bold(pc.bgCyan(pc.black(' [CLI TEST] INPUT ')))} ${pc.cyan(`${command} ${args.join(' ')}`)}`,
  );
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
      console.log(
        `${pc.bold(pc.bgYellow(pc.black(' [CLI TEST] OUTPUT ')))} [exit code: ${code}]\n${pc.yellow(output.trim() ? output : '[no output]')}`,
      );
      resolve({ code: code ?? 0, output });
    });
  });
}

function cleanUpSystem() {
  try {
    const libPath = join(rootDir, 'lib');

    if (existsSync(libPath)) {
      if (process.platform === 'win32') {
        execSync(`rd /s /q "${libPath}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${libPath}"`, { stdio: 'inherit' });
      }
    }

    execSync('npm uninstall -g envilder', { stdio: 'inherit' });
  } catch {
    // Ignore errors if not installed
  }
}
