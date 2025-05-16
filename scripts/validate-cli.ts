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

    // Test 2: Check if help works (try global command first, then local if global fails)
    console.log('Testing envilder help command...');
    const helpCheck = await runCommand('envilder', ['--help']);
    let helpOutput = '';
    let helpExitCode = 0;

    if (helpCheck.code !== 0) {
      console.log('Global envilder command not found, trying direct Node.js execution...');
      // Try with direct node execution if global command fails
      const directHelpCheck = await runCommand('node', ['./lib/cli/cli.js', '--help']);
      helpOutput = directHelpCheck.output;
      helpExitCode = directHelpCheck.code;

      if (directHelpCheck.code !== 0) {
        console.error('Command output:', directHelpCheck.output);
        throw new Error(
          `❌ envilder help command failed with both global and direct execution. Exit code: ${directHelpCheck.code}`,
        );
      }
    } else {
      helpOutput = helpCheck.output;
      helpExitCode = helpCheck.code;
    }

    if (!helpOutput.includes('--map') || !helpOutput.includes('--envfile')) {
      console.error('Command output:', helpOutput);
      throw new Error('❌ envilder help command output is missing expected options');
    }
    console.log('✅ envilder help command works');

    // Test 3: Check if sample file generation works (try global command first, then local if global fails)
    const testEnvFile = join(rootDir, 'tests', 'sample', 'cli-validation.env');
    console.log(`Testing envilder file generation with output to: ${testEnvFile}`);

    // Try with global command first
    const sampleTest = await runCommand('envilder', [
      '--map',
      join(rootDir, 'tests', 'sample', 'param-map.json'),
      '--envfile',
      testEnvFile,
    ]);

    let sampleOutput = '';
    let sampleExitCode = 0;

    if (sampleTest.code !== 0) {
      console.log('Global envilder command failed, trying direct Node.js execution...');
      // Try with direct node execution if global command fails
      const directSampleTest = await runCommand('node', [
        './lib/cli/cli.js',
        '--map',
        join(rootDir, 'tests', 'sample', 'param-map.json'),
        '--envfile',
        testEnvFile,
      ]);

      sampleOutput = directSampleTest.output;
      sampleExitCode = directSampleTest.code;

      if (directSampleTest.code !== 0) {
        console.error('Command output:', directSampleTest.output);
        throw new Error(
          `❌ envilder failed to generate environment file with both global and direct execution. Exit code: ${directSampleTest.code}`,
        );
      }
    } else {
      sampleOutput = sampleTest.output;
      sampleExitCode = sampleTest.code;
    }

    if (!sampleOutput.includes('Environment File generated')) {
      console.error('Command output:', sampleOutput);
      throw new Error('❌ envilder did not output expected success message');
    }

    // Verify the file was actually created
    if (!existsSync(testEnvFile)) {
      throw new Error(`❌ envilder did not create the environment file at ${testEnvFile}`);
    }
    console.log('✅ envilder successfully generated environment file');

    // Test 4: Check error handling for invalid arguments (try global command first, then local if global fails)
    console.log('Testing envilder with invalid arguments...');
    const errorTest = await runCommand('envilder', ['--invalid']);

    if (errorTest.code === 0) {
      // Try with direct execution instead
      const directErrorTest = await runCommand('node', ['./lib/cli/cli.js', '--invalid']);
      if (directErrorTest.code === 0) {
        console.error('Command output:', directErrorTest.output);
        throw new Error('❌ envilder should fail with invalid arguments');
      }
    }
    console.log('✅ envilder properly handles invalid arguments');

    // Test 5: Check error handling for missing required options (try global command first, then local if global fails)
    console.log('Testing envilder with missing required options...');
    const missingOptionsTest = await runCommand('envilder', []);

    if (missingOptionsTest.code === 0) {
      // Try with direct execution instead
      const directMissingOptionsTest = await runCommand('node', ['./lib/cli/cli.js']);
      if (directMissingOptionsTest.code === 0) {
        console.error('Command output:', directMissingOptionsTest.output);
        throw new Error('❌ envilder should fail when required options are missing');
      }
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

        console.error('📂 Checking npm global bin directory:');
        const npmBin = await runCommand('npm', ['bin', '-g']);
        console.error('NPM global bin:', npmBin.output);

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

        // Check the global installations
        console.error('📦 Checking global npm installations:');
        const npmList = await runCommand('npm', ['list', '-g', '--depth=0']);
        console.error('Global NPM packages:', npmList.output);
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
