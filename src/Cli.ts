#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { EnvilderBuilder } from './cli/application/builders/EnvilderBuilder.js';
import { DispatchActionCommand } from './cli/application/dispatch/DispatchActionCommand.js';
import { DispatchActionCommandHandler } from './cli/application/dispatch/DispatchActionCommandHandler.js';
import { ConsoleLogger } from './cli/infrastructure/Logger/ConsoleLogger.js';
import { PackageJsonFinder } from './cli/infrastructure/VersionFinder/PackageJsonFinder.js';

type CliOptions = {
  map?: string;
  envfile?: string;
  key?: string;
  value?: string;
  ssmPath?: string;
  profile?: string;
  import?: boolean;
};

async function executeCommand(options: CliOptions): Promise<void> {
  const envilder = EnvilderBuilder.build()
    .withConsoleLogger()
    .withDefaultFileManager()
    .withAwsProvider(options.profile)
    .create();

  const command = DispatchActionCommand.fromCliOptions(options);
  const commandHandler = new DispatchActionCommandHandler(envilder);
  await commandHandler.handleCommand(command);
}

export async function main() {
  const program = new Command();
  const version = await readPackageVersion();

  program
    .name('envilder')
    .description('A CLI tool to manage environment variables with AWS SSM')
    .version(version)
    .option(
      '--map <path>',
      'Path to the JSON file with environment variable mapping',
    )
    .option(
      '--envfile <path>',
      'Path to the .env file to be generated or imported',
    )
    .option('--key <name>', 'Single environment variable name to push')
    .option(
      '--value <value>',
      'Value of the single environment variable to push',
    )
    .option('--ssm-path <path>', 'SSM path for the single environment variable')
    .option('--profile <name>', 'AWS CLI profile to use')
    .option('--import', 'Push local .env file back to AWS SSM')
    .action(async (options: CliOptions) => {
      await executeCommand(options);
    });

  await program.parseAsync(process.argv);
}

function readPackageVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '../package.json');

  return new PackageJsonFinder().readPackageJsonVersion(packageJsonPath);
}

main().catch((error) => {
  const logger = new ConsoleLogger();
  logger.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
  logger.error(error instanceof Error ? error.message : String(error));
});
