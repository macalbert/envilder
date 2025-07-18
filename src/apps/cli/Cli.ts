#!/usr/bin/env node
import 'reflect-metadata';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { DispatchActionCommand } from '../../envilder/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { CliOptions } from '../../envilder/domain/CliOptions.js';
import type { ILogger } from '../../envilder/domain/ports/ILogger.js';
import { PackageVersionReader } from '../../envilder/infrastructure/package/PackageVersionReader.js';
import { TYPES } from '../../envilder/types.js';
import { Startup } from './Startup.js';

async function executeCommand(options: CliOptions): Promise<void> {
  const serviceProvider = Startup.build()
    .configureServices()
    .configureInfrastructure(options.profile)
    .create();

  const commandHandler = serviceProvider.get<DispatchActionCommandHandler>(
    TYPES.DispatchActionCommandHandler,
  );

  const command = DispatchActionCommand.fromCliOptions(options);
  await commandHandler.handleCommand(command);
}

export async function main() {
  const program = new Command();
  const version = await readPackageVersion();

  program
    .name('envilder')
    .description(
      '🌟 A CLI tool to manage environment variables with AWS SSM. What do you want to do today?\n\n' +
        '✨ Generate a .env file?\n' +
        '  Example: envilder --map=param-map.json --envfile=.env\n\n' +
        '🔄 Sync your local .env file back to AWS SSM?\n' +
        '  Example: envilder --push --map=param-map.json --envfile=.env\n\n' +
        '🎯 Create or update a single secret?\n' +
        '  Example: envilder --push --key=API_KEY --value=secret123 --ssm-path=/my/path\n',
    )
    .version(version)
    .option(
      '--map <path>',
      'Path to the JSON file with environment variable mapping (required for most commands)',
    )
    .option(
      '--envfile <path>',
      'Path to the .env file to be generated or imported (required for most commands)',
    )
    .option('--profile <name>', 'AWS CLI profile to use (optional)')
    .option('--push', 'Push local .env file back to AWS SSM')
    .option(
      '--key <name>',
      'Single environment variable name to push (only with --push)',
    )
    .option(
      '--value <value>',
      'Value of the single environment variable to push (only with --push)',
    )
    .option(
      '--ssm-path <path>',
      'SSM path for the single environment variable (only with --push)',
    )
    .action(async (options: CliOptions) => {
      await executeCommand(options);
    });

  await program.parseAsync(process.argv);
}

function readPackageVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '../../../package.json');

  return new PackageVersionReader().getVersion(packageJsonPath);
}

main().catch((error) => {
  const serviceProvider = Startup.build()
    .configureServices()
    .configureInfrastructure()
    .create();

  const logger = serviceProvider.get<ILogger>(TYPES.ILogger);
  logger.error('🚨 Uh-oh! Looks like Mario fell into the wrong pipe! 🍄💥');
  logger.error(error instanceof Error ? error.message : String(error));
});
