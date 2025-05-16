#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const isGithubAction = process.env.GITHUB_ACTIONS === 'true';

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
    // Test 1: Check if envilder is accessible
  const whichEnvilder = await runCommand('where', ['envilder']);
  console.log('Looking for envilder in:', process.env.PATH);
  console.log('Envilder location:', whichEnvilder.output);
  
  const versionCheck = await runCommand('node', ['./lib/cli/cli.js', '--version']);
  if (versionCheck.code !== 0) {
    throw new Error('❌ envilder command not working. Make sure it is properly installed.');
  }
  console.log('✅ envilder command is accessible');
  
  // Test 2: Check if help works
  const helpCheck = await runCommand('envilder', ['--help']);
  if (helpCheck.code !== 0 || !helpCheck.output.includes('--map') || !helpCheck.output.includes('--envfile')) {
    throw new Error('❌ envilder help command not working correctly');
  }
  console.log('✅ envilder help command works');

  // Test 3: Check if sample file generation works
  const testEnvFile = join(rootDir, 'tests', 'sample', 'cli-validation.env');
  const sampleTest = await runCommand('envilder', [
    '--map', join(rootDir, 'tests', 'sample', 'param-map.json'),
    '--envfile', testEnvFile
  ]);
  
  if (sampleTest.code !== 0 || !sampleTest.output.includes('Environment File generated')) {
    throw new Error('❌ envilder failed to generate environment file');
  }

  // Verify the file was actually created
  if (!existsSync(testEnvFile)) {
    throw new Error('❌ envilder did not create the environment file');
  }
  console.log('✅ envilder successfully generated environment file');

  // Test 4: Check error handling for invalid arguments
  const errorTest = await runCommand('envilder', ['--invalid']);
  if (errorTest.code === 0) {
    throw new Error('❌ envilder should fail with invalid arguments');
  }
  console.log('✅ envilder properly handles invalid arguments');

  // Test 5: Check error handling for missing required options
  const missingOptionsTest = await runCommand('envilder', []);
  if (missingOptionsTest.code === 0) {
    throw new Error('❌ envilder should fail when required options are missing');
  }
  console.log('✅ envilder properly handles missing required options');

  console.log(`🎉 All CLI validation tests passed${isGithubAction ? ' in GitHub Actions' : ''}!`);
}

validateCLI().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
