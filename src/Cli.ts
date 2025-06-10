#!/usr/bin/env node
import { Command } from 'commander';
import { EnvilderBuilder } from './cli/domain/EnvilderBuilder.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PackageJsonFinder } from './cli/infrastructure/PackageJsonFinder.js';

/**
 * Parses CLI arguments and runs the environment file generator.
 *
 * Expects `--map` and `--envfile` options to be provided, with an optional `--profile` for AWS CLI profile selection. Invokes the main process to generate a `.env` file from AWS SSM parameters based on the provided mapping.
 *
 * @throws {Error} If either `--map` or `--envfile` arguments are missing.
 */
export async function main() {
  const program = new Command();
  const version = await getVersion();

  program
    .name('envilder')
    .description('A CLI tool to generate .env files from AWS SSM parameters')
    .version(version)
    .requiredOption(
      '--map <path>',
      'Path to the JSON file with environment variable mapping',
    )
    .requiredOption('--envfile <path>', 'Path to the .env file to be generated')
    .option('--profile <name>', 'AWS CLI profile to use');

  await program.parseAsync(process.argv);
  const options = program.opts();

  if (!options.map || !options.envfile) {
    throw new Error('Missing required arguments: --map and --envfile');
  }

  const envilder = EnvilderBuilder.build()
    .withDefaultFileManager()
    .withAwsProvider(options.profile)
    .create();

  await envilder.run(options.map, options.envfile);
}

function getVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  return new PackageJsonFinder().readPackageJsonVersion(
    join(__dirname, '../package.json'),
  );
}

main().catch((error) => {
  console.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
  console.error(error);
});
