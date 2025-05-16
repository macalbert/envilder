#!/usr/bin/env node
import { Command } from 'commander';
import { run } from '../index.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

// Get package.json path by searching up from current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findPackageJson(startDir: string): string {
  let currentDir = startDir;
  while (currentDir !== dirname(currentDir)) {
    const packagePath = join(currentDir, 'package.json');
    if (existsSync(packagePath)) {
      return packagePath;
    }
    currentDir = dirname(currentDir);
  }
  throw new Error('package.json not found in parent directories');
}

const packageJson = JSON.parse(readFileSync(findPackageJson(__dirname), 'utf8'));

/**
 * Parses CLI arguments and runs the environment file generator.
 *
 * Expects `--map` and `--envfile` options to be provided, with an optional `--profile` for AWS CLI profile selection. Invokes the main process to generate a `.env` file from AWS SSM parameters based on the provided mapping.
 *
 * @throws {Error} If either `--map` or `--envfile` arguments are missing.
 */
export async function main() {
  const program = new Command();
  program
    .name('envilder')
    .description('A CLI tool to generate .env files from AWS SSM parameters')
    .version(packageJson.version)
    .requiredOption('--map <path>', 'Path to the JSON file with environment variable mapping')
    .requiredOption('--envfile <path>', 'Path to the .env file to be generated')
    .option('--profile <name>', 'AWS CLI profile to use');

  await program.parseAsync(process.argv);
  const options = program.opts();

  if (!options.map || !options.envfile) {
    throw new Error('Missing required arguments: --map and --envfile');
  }

  await run(options.map, options.envfile, options.profile);
}

// Execute the CLI
main().catch((error) => {
  console.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
  console.error(error);
  process.exit(1);
});
