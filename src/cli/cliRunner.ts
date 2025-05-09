#!/usr/bin/env node

import { Command } from 'commander';
import { run } from '../index.js';

/**
 * Parses CLI arguments and runs the environment file generator.
 *
 * Expects `--map` and `--envfile` options to be provided, with an optional `--profile` for AWS CLI profile selection. Invokes the main process to generate a `.env` file from AWS SSM parameters based on the provided mapping.
 *
 * @throws {Error} If either `--map` or `--envfile` arguments are missing.
 */
export async function cliRunner() {
  const program = new Command();

  program
    .name('envilder')
    .description('A CLI tool to generate .env files from AWS SSM parameters')
    .version('0.1.0')
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

cliRunner().catch((error) => {
  console.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
});
