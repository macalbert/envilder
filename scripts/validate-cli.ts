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
  console.log(`🔍 Validating envilder CLI installation ${isGithubAction ? 'in GitHub Actions' : 'locally'}...`);

  try {
    // Test 1: Check if envilder is accessible
    // Use 'where' on Windows and 'which' on Unix/Linux
    const findCommand = isWindows ? 'where' : 'which';
    console.log(`Using ${findCommand} command to locate envilder`);
    const whichEnvilder = await runCommand(findCommand, ['envilder']);
    console.log('Looking for envilder in:', process.env.PATH);
    console.log('Envilder location:', whichEnvilder.output);

    if (whichEnvilder.code !== 0) {
      console.warn(`⚠️ Could not find envilder with ${findCommand} command. Will try direct execution anyway.`);
    }

    // Check if CLI is working by running version command directly through Node.js
    console.log('Testing envilder by executing the built JavaScript file directly...');
    const versionCheck = await runCommand('node', ['./lib/cli/cli.js', '--version']);
    if (versionCheck.code !== 0) {
      throw new Error(`❌ envilder command not working. Make sure it is properly built:\n${versionCheck.output}`);
    }
    console.log('✅ envilder CLI file is executable');

    // Test 2: Check if help works via global command
    console.log('Testing envilder help command...');
    const helpCheck = await runCommand('envilder', ['--help']);
    if (helpCheck.code !== 0) {
      console.error('Command output:', helpCheck.output);
      throw new Error(`❌ envilder help command failed with exit code: ${helpCheck.code}`);
    }

    if (!helpCheck.output.includes('--map') || !helpCheck.output.includes('--envfile')) {
      console.error('Command output:', helpCheck.output);
      throw new Error('❌ envilder help command output is missing expected options');
    }
    console.log('✅ envilder help command works');

    // Test 3: Check if sample file generation works
    const testEnvFile = join(rootDir, 'tests', 'sample', 'cli-validation.env');
    console.log(`Testing envilder file generation with output to: ${testEnvFile}`);
    const sampleTest = await runCommand('envilder', [
      '--map',
      join(rootDir, 'tests', 'sample', 'param-map.json'),
      '--envfile',
      testEnvFile,
    ]);

    if (sampleTest.code !== 0) {
      console.error('Command output:', sampleTest.output);
      throw new Error(`❌ envilder failed to generate environment file with exit code: ${sampleTest.code}`);
    }

    if (!sampleTest.output.includes('Environment File generated')) {
      console.error('Command output:', sampleTest.output);
      throw new Error('❌ envilder did not output expected success message');
    }

    // Verify the file was actually created
    if (!existsSync(testEnvFile)) {
      throw new Error(`❌ envilder did not create the environment file at ${testEnvFile}`);
    }
    console.log('✅ envilder successfully generated environment file');

    // Test 4: Check error handling for invalid arguments
    console.log('Testing envilder with invalid arguments...');
    const errorTest = await runCommand('envilder', ['--invalid']);
    if (errorTest.code === 0) {
      console.error('Command output:', errorTest.output);
      throw new Error('❌ envilder should fail with invalid arguments');
    }
    console.log('✅ envilder properly handles invalid arguments');

    // Test 5: Check error handling for missing required options
    console.log('Testing envilder with missing required options...');
    const missingOptionsTest = await runCommand('envilder', []);
    if (missingOptionsTest.code === 0) {
      console.error('Command output:', missingOptionsTest.output);
      throw new Error('❌ envilder should fail when required options are missing');
    }
    console.log('✅ envilder properly handles missing required options');

    console.log(`🎉 All CLI validation tests passed${isGithubAction ? ' in GitHub Actions' : ''}!`);
  } catch (error) {
    if (error instanceof Error) {
      // Additional debugging info when in GitHub Actions
      if (isGithubAction) {
        console.error('🔍 In GitHub Actions environment, checking PATH configuration:');
        const pathCheck = await runCommand('echo', ['$PATH']);
        console.error('PATH environment variable:', pathCheck.output);

        console.error('📂 Checking Yarn global bin directory:');
        const yarnGlobalBin = await runCommand('yarn', ['global', 'bin']);
        console.error('Yarn global bin:', yarnGlobalBin.output);

        console.error('📝 Checking package.json bin configuration:');
        const catPackageJson = await runCommand('cat', ['package.json']);
        console.error('package.json content excerpt:');
        const lines = catPackageJson.output.split('\n');
        // Find and print the "bin" section
        let inBinSection = false;
        for (const line of lines) {
          if (line.includes('"bin"')) inBinSection = true;
          if (inBinSection) {
            console.error(line);
            if (line.includes('}')) break;
          }
        }
      }

      // Rethrow the original error
      throw error;
    }

    throw new Error('Unknown error occurred during CLI validation');
  }
}

validateCLI().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
