#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { createEnvilderWithAwsSsm } from './cli/domain/EnvilderFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Find the package.json file by traversing up directories
 * @param startDir The directory to start searching from
 * @param maxDepth Maximum number of parent directories to check
 * @returns Path to package.json if found, or null if not found
 */
function findPackageJson(startDir: string, maxDepth = 5): string | null {
  let currentDir = startDir;
  let depth = 0;

  while (depth < maxDepth) {
    const packagePath = join(currentDir, 'package.json');
    if (existsSync(packagePath)) {
      return packagePath;
    }

    // Go up one directory
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      // We've reached the root
      break;
    }

    currentDir = parentDir;
    depth++;
  }

  return null;
}

// Get package.json path by searching up from current file
const packageJsonPath = findPackageJson(__dirname) || join(__dirname, '..', '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

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

  const envilder = createEnvilderWithAwsSsm(options.profile);

  await envilder.run(options.map, options.envfile);
}

// Execute the CLI
main().catch((error) => {
  console.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
  console.error(error);
});
