#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

/**
 * Run a command with the given arguments
 */
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

async function validateCLI() {
  console.log('🔍 Validating global envilder CLI (from your PATH)...');

  const cliCmd = 'envilder';
  const expectedVersion = pkg.version;

  try {
    // Test 1: Check CLI version and accessibility
    console.log('Testing envilder version command...');
    const versionResult = await runCommand(cliCmd, ['--version']);
    console.log('[envilder --version output]:');
    console.log(versionResult.output);
    if (versionResult.code !== 0) {
      throw new Error(`❌ envilder version command failed: ${versionResult.output}`);
    }
    const actualVersion = versionResult.output.trim();
    if (actualVersion !== expectedVersion) {
      throw new Error(`❌ envilder version mismatch: expected ${expectedVersion}, got ${actualVersion}`);
    }
    console.log('✅ envilder version command works and matches package.json');

    // Test 2: Check help command
    console.log('Testing envilder help command...');
    const helpResult = await runCommand(cliCmd, ['--help']);
    console.log('[envilder --help output]:');
    console.log(helpResult.output);
    if (helpResult.code !== 0) {
      throw new Error(`❌ envilder help command failed: ${helpResult.output}`);
    }
    if (!helpResult.output.includes('--map') || !helpResult.output.includes('--envfile')) {
      throw new Error('❌ envilder help command output is missing expected options');
    }
    console.log('✅ envilder help command works');

    // Test 3: Check sample file generation
    const testEnvFile = join(rootDir, 'tests', 'sample', 'cli-validation.env');
    console.log('Testing envilder file generation...');
    const sampleResult = await runCommand(cliCmd, [
      '--map',
      join(rootDir, 'tests', 'sample', 'param-map.json'),
      '--envfile',
      testEnvFile,
    ]);
    console.log('[envilder file generation output]:');
    console.log(sampleResult.output);
    if (sampleResult.code !== 0) {
      throw new Error(`❌ envilder failed to generate environment file: ${sampleResult.output}`);
    }
    if (!sampleResult.output.includes('Environment File generated')) {
      throw new Error('❌ envilder did not output expected success message');
    }
    if (!existsSync(testEnvFile)) {
      throw new Error(`❌ envilder did not create the environment file at ${testEnvFile}`);
    }
    console.log('✅ envilder successfully generated environment file');

    // Test 4: Check error handling for invalid arguments
    console.log('Testing envilder with invalid arguments...');
    const errorResult = await runCommand(cliCmd, ['--invalid']);
    console.log('[envilder --invalid output]:');
    console.log(errorResult.output);
    if (errorResult.code === 0) {
      throw new Error('❌ envilder should fail with invalid arguments');
    }
    console.log('✅ envilder properly handles invalid arguments');

    // Test 5: Check error handling for missing required options
    console.log('Testing envilder with missing required options...');
    const missingResult = await runCommand(cliCmd, []);
    console.log('[envilder (no args) output]:');
    console.log(missingResult.output);
    if (missingResult.code === 0) {
      throw new Error('❌ envilder should fail when required options are missing');
    }
    console.log('✅ envilder properly handles missing required options');

    console.log('🎉 All CLI validation tests passed!');
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error occurred during CLI validation');
    }
    process.exit(1);
  }
}

validateCLI().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
