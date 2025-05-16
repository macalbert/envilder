#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const isGithubAction = process.env.GITHUB_ACTIONS === 'true';
const isWindows = process.platform === 'win32';
const findCommand = isWindows ? 'where' : 'which';

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

/**
 * Try to run a command with both global and local CLI approaches
 */
async function tryCommandWithFallback(
  args: string[],
): Promise<{ code: number; output: string; usedFallback: boolean }> {
  // Try global command first
  const globalResult = await runCommand('envilder', args);

  if (globalResult.code === 0) {
    return { ...globalResult, usedFallback: false };
  }

  // Fall back to direct node execution
  console.log('Global envilder command failed, trying direct Node.js execution...');
  const directResult = await runCommand('node', ['./lib/cli/cli.js', ...args]);

  return {
    ...directResult,
    usedFallback: true,
  };
}

async function validateCLI() {
  console.log(`🔍 Validating envilder CLI installation${isGithubAction ? ' in GitHub Actions' : ''}...`);

  try {
    // Test 1: Check CLI version and accessibility
    console.log('Testing envilder version command...');
    const versionResult = await tryCommandWithFallback(['--version']);

    if (versionResult.code !== 0) {
      throw new Error(`❌ envilder version command failed: ${versionResult.output}`);
    }
    console.log('✅ envilder version command works');

    // Test 2: Check help command
    console.log('Testing envilder help command...');
    const helpResult = await tryCommandWithFallback(['--help']);

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

    const sampleResult = await tryCommandWithFallback([
      '--map',
      join(rootDir, 'tests', 'sample', 'param-map.json'),
      '--envfile',
      testEnvFile,
    ]);

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
    const errorResult = await tryCommandWithFallback(['--invalid']);

    if (errorResult.code === 0) {
      throw new Error('❌ envilder should fail with invalid arguments');
    }
    console.log('✅ envilder properly handles invalid arguments');

    // Test 5: Check error handling for missing required options
    console.log('Testing envilder with missing required options...');
    const missingResult = await tryCommandWithFallback([]);

    if (missingResult.code === 0) {
      throw new Error('❌ envilder should fail when required options are missing');
    }
    console.log('✅ envilder properly handles missing required options');

    console.log(`🎉 All CLI validation tests passed!`);
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
