import 'reflect-metadata';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import type { Container } from 'inversify';
import { DispatchActionCommand } from '../../envilder/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../envilder/application/dispatch/DispatchActionCommandHandler.js';
import type { CliOptions } from '../../envilder/domain/CliOptions.js';
import type { MapFileConfig } from '../../envilder/domain/MapFileConfig.js';
import { PackageVersionReader } from '../../envilder/infrastructure/package/PackageVersionReader.js';
import { readMapFileConfig } from '../../envilder/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../envilder/types.js';
import { Startup } from './Startup.js';

let serviceProvider: Container;

async function executeCommand(options: CliOptions): Promise<void> {
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
      '🌟 A CLI tool to manage environment variables with AWS SSM or Azure Key Vault. What do you want to do today?\n\n' +
        '✨ Generate a .env file?\n' +
        '  Example: envilder --map=param-map.json --envfile=.env\n\n' +
        '🔄 Sync your local .env file back to your cloud provider?\n' +
        '  Example: envilder --push --map=param-map.json --envfile=.env\n\n' +
        '🎯 Create or update a single secret?\n' +
        '  Example: envilder --push --key=API_KEY --value=secret123 --secret-path=/my/path\n\n' +
        '☁️  Use Azure Key Vault?\n' +
        '  Example: envilder --provider=azure --map=param-map.json --envfile=.env\n',
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
    .option(
      '--provider <name>',
      'Cloud provider to use: aws or azure (default: aws)',
    )
    .option(
      '--vault-url <url>',
      'Azure Key Vault URL (overrides $config.vaultUrl in map file)',
    )
    .option('--push', 'Push local .env file back to cloud provider')
    .option(
      '--key <name>',
      'Single environment variable name to push (only with --push)',
    )
    .option(
      '--value <value>',
      'Value of the single environment variable to push (only with --push)',
    )
    .option(
      '--secret-path <path>',
      'Secret path in your cloud provider for the single variable (only with --push)',
    )
    .action(
      async ({
        provider,
        vaultUrl,
        ...options
      }: CliOptions & { provider?: string; vaultUrl?: string }) => {
        const fileConfig = options.map
          ? await readMapFileConfig(options.map)
          : {};

        const config: MapFileConfig = {
          ...fileConfig,
          ...(provider && { provider }),
          ...(vaultUrl && { vaultUrl }),
          ...(options.profile && { profile: options.profile }),
        };

        const infraOptions: Record<string, unknown> = {};
        const extraHosts = process.env.ENVILDER_ALLOWED_VAULT_HOSTS;
        if (extraHosts) {
          infraOptions.allowedVaultHosts = extraHosts
            .split(',')
            .map((h) => h.trim());
          infraOptions.disableChallengeResourceVerification = true;
        }

        serviceProvider = Startup.build()
          .configureServices()
          .configureInfrastructure(config, infraOptions)
          .create();

        await executeCommand(options);
      },
    );

  await program.parseAsync(process.argv);
}

function readPackageVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '../../../package.json');

  return new PackageVersionReader().getVersion(packageJsonPath);
}
