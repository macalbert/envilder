#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SSMClientConfig } from '@aws-sdk/client-ssm';
import { SSM } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { Command } from 'commander';
import { DispatchActionCommandHandlerBuilder } from './cli/application/dispatch/builders/DispatchActionCommandHandlerBuilder.js';
import { DispatchActionCommand } from './cli/application/dispatch/DispatchActionCommand.js';
import type { CliOptions } from './cli/domain/CliOptions.js';
import { AwsSsmSecretProvider } from './cli/infrastructure/aws/AwsSsmSecretProvider.js';
import { EnvFileManager } from './cli/infrastructure/envManager/EnvFileManager.js';
import { ConsoleLogger } from './cli/infrastructure/logger/ConsoleLogger.js';
import { PackageJsonFinder } from './cli/infrastructure/versionFinder/PackageJsonFinder.js';

async function executeCommand(options: CliOptions): Promise<void> {
  const logger = new ConsoleLogger();
  const fileManager = new EnvFileManager(logger);

  const ssm = options.profile
    ? new SSM({
        credentials: fromIni({ profile: options.profile }),
      } as SSMClientConfig)
    : new SSM();

  const secretProvider = new AwsSsmSecretProvider(ssm);

  const commandHandler = DispatchActionCommandHandlerBuilder.build()
    .withLogger(logger)
    .withEnvFileManager(fileManager)
    .withProvider(secretProvider)
    .create();

  const command = DispatchActionCommand.fromCliOptions(options);
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
