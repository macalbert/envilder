import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command, CommanderError, Option } from 'commander';
import type { Container } from 'inversify';
import pc from 'picocolors';
import { DispatchActionCommand } from '../../../core/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../../core/application/dispatch/DispatchActionCommandHandler.js';
import { formatCommandLine } from '../../../core/application/execWithSecrets/CommandLineFormatter.js';
import { ExecWithSecretsCommand } from '../../../core/application/execWithSecrets/ExecWithSecretsCommand.js';
import type {
  ExecWithSecretsCommandHandler,
  PreparedExec,
} from '../../../core/application/execWithSecrets/ExecWithSecretsCommandHandler.js';
import type { CliOptions } from '../../../core/domain/CliOptions.js';
import {
  EXEC_COMMAND_NOT_EXECUTABLE,
  EXEC_COMMAND_NOT_FOUND,
  EXEC_ENVILDER_FAILURE,
} from '../../../core/domain/ExecExitCode.js';
import {
  CommandNotExecutableError,
  CommandNotFoundError,
  InvalidArgumentError,
} from '../../../core/domain/errors/DomainErrors.js';
import type { MapFileConfig } from '../../../core/domain/MapFileConfig.js';
import { OperationMode } from '../../../core/domain/OperationMode.js';
import type { ILogger } from '../../../core/domain/ports/ILogger.js';
import { PackageVersionReader } from '../../../core/infrastructure/package/PackageVersionReader.js';
import { readMapFileConfig } from '../../../core/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../../core/types.js';
import { presentError } from '../errors/CliErrorPresenter.js';
import { SilentExitError } from '../errors/SilentExitError.js';
import {
  createConfirm,
  executeWithSsoRecovery,
} from '../recovery/SsoLoginRecovery.js';
import { Startup } from '../Startup.js';

const DEFAULT_MAP_FILE = 'envilder.json';
const DEFAULT_ENV_FILE = '.env';
const EXEC_USAGE = 'envilder exec [options] [--] <command> [args...]';

type ExecOptions = {
  map?: string;
  profile?: string;
  provider?: string;
  vaultUrl?: string;
  envfile?: string;
  push?: boolean;
  key?: string;
  value?: string;
  secretPath?: string;
  ssmPath?: string;
};

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

  const banner = `
  ${pc.green('███████╗')}${pc.cyan('███╗   ██╗')}${pc.magenta('██╗   ██╗')}${pc.yellow('██╗')}${pc.red('██╗     ')}${pc.blue('██████╗ ')}${pc.green('███████╗')}${pc.cyan('██████╗ ')}
  ${pc.green('██╔════╝')}${pc.cyan('████╗  ██║')}${pc.magenta('██║   ██║')}${pc.yellow('██║')}${pc.red('██║     ')}${pc.blue('██╔══██╗')}${pc.green('██╔════╝')}${pc.cyan('██╔══██╗')}
  ${pc.green('█████╗  ')}${pc.cyan('██╔██╗ ██║')}${pc.magenta('██║   ██║')}${pc.yellow('██║')}${pc.red('██║     ')}${pc.blue('██║  ██║')}${pc.green('█████╗  ')}${pc.cyan('██████╔╝')}
  ${pc.green('██╔══╝  ')}${pc.cyan('██║╚██╗██║')}${pc.magenta('╚██╗ ██╔╝')}${pc.yellow('██║')}${pc.red('██║     ')}${pc.blue('██║  ██║')}${pc.green('██╔══╝  ')}${pc.cyan('██╔══██╗')}
  ${pc.green('███████╗')}${pc.cyan('██║ ╚████║')}${pc.magenta(' ╚████╔╝ ')}${pc.yellow('██║')}${pc.red('███████╗')}${pc.blue('██████╔╝')}${pc.green('███████╗')}${pc.cyan('██║  ██║')}
  ${pc.green('╚══════╝')}${pc.cyan('╚═╝  ╚═══╝')}${pc.magenta('  ╚═══╝  ')}${pc.yellow('╚═╝')}${pc.red('╚══════╝')}${pc.blue('╚═════╝ ')}${pc.green('╚══════╝')}${pc.cyan('╚═╝  ╚═╝')}
  ${pc.dim('Your secrets, one command away')}          ${pc.dim('aws & azure')}

  ${pc.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
  ${pc.green('WORLD 1-1')} ${pc.dim('— SELECT YOUR MISSION')}
  ${pc.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

  ${pc.green('>')} ${pc.bold('Generate a .env file')}  ${pc.dim('(pull secrets from the cloud)')}
    ${pc.cyan('envilder')}  ${pc.dim('# uses envilder.json → .env by default')}

  ${pc.magenta('>')} ${pc.bold('Sync .env back to cloud')}  ${pc.dim('(push secrets up)')}
    ${pc.cyan('envilder --push')}  ${pc.dim('# uses envilder.json + .env by default')}

  ${pc.red('>')} ${pc.bold('Push a single secret')}
    ${pc.cyan('envilder --key=API_KEY --value=s3cret --secret-path=/my/path')}

  ${pc.blue('>')} ${pc.bold('Use Azure Key Vault')}
    ${pc.cyan('envilder --provider=azure --vault-url=https://my-vault.vault.azure.net')}

  ${pc.yellow('>')} ${pc.bold('Run a command with secrets')}  ${pc.dim('(nothing written to disk)')}
    ${pc.cyan('envilder exec -- npm run dev')}  ${pc.dim('# see: envilder exec --help')}
`;

  program
    .name('envilder')
    .description(banner)
    .version(version)
    .enablePositionalOptions()
    .helpCommand(false)
    .option(
      '--map <path>',
      `Path to the JSON file with environment variable mapping (default: ${DEFAULT_MAP_FILE})`,
    )
    .option(
      '--envfile <path>',
      `Path to the .env file to be generated or imported (default: ${DEFAULT_ENV_FILE})`,
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
    .option('--push', 'Push a map-file-backed .env file to the cloud provider')
    .option(
      '--key <name>',
      'Environment variable name; with --value and --secret-path, performs a single-secret push (no --push required)',
    )
    .option(
      '--value <value>',
      'Secret value; with --key and --secret-path, performs a single-secret push (no --push required)',
    )
    .option(
      '--secret-path <path>',
      'Cloud secret path; with --key and --value, performs a single-secret push (no --push required)',
    )
    .option(
      '--ssm-path <path>',
      '[DEPRECATED: use --secret-path] Alias for --secret-path',
    )
    .hook('preAction', (thisCommand, actionCommand) => {
      // Root options placed before a subcommand are rejected by it instead.
      if (actionCommand !== thisCommand) {
        return;
      }
      const opts = thisCommand.opts();
      // Alias on presence, not truthiness: an explicitly empty --ssm-path must
      // reach the single-secret guard below instead of vanishing silently.
      if (opts.ssmPath !== undefined) {
        console.warn(
          pc.yellow(
            '⚠️  --ssm-path is deprecated and will be removed in a future release. Use --secret-path instead.',
          ),
        );
        if (opts.secretPath === undefined) {
          thisCommand.setOptionValue('secretPath', opts.ssmPath);
        }
      }
    })
    .action(
      async ({
        provider,
        vaultUrl,
        ...options
      }: CliOptions & { provider?: string; vaultUrl?: string }) => {
        const singleSecretOptions = [
          options.key,
          options.value,
          options.secretPath,
        ];
        const hasPartialSingleSecretOptions =
          singleSecretOptions.some((option) => option !== undefined) &&
          !singleSecretOptions.every((option) => Boolean(option));
        if (hasPartialSingleSecretOptions) {
          throw new InvalidArgumentError(
            'Single-secret push requires non-empty --key, --value, and --secret-path.',
          );
        }

        const mode = DispatchActionCommand.determineOperationMode(options);
        const isPushSingle = mode === OperationMode.PUSH_SINGLE;
        const resolvedMap = resolveMapFile(options.map, {
          required: !isPushSingle,
        });
        const resolvedEnvfile = resolveEnvfile(options.envfile);

        const resolvedOptions: CliOptions = {
          ...options,
          map: resolvedMap,
          envfile: resolvedEnvfile,
        };

        const fileConfig = resolvedMap
          ? await readMapFileConfig(resolvedMap)
          : {};

        const config: MapFileConfig = {
          ...fileConfig,
          ...(provider && { provider }),
          ...(vaultUrl && { vaultUrl }),
          ...(options.profile && { profile: options.profile }),
        };

        const infraOptions = buildInfrastructureOptions();

        serviceProvider = Startup.build()
          .configureServices()
          .configureInfrastructure(config, infraOptions)
          .create();

        if (isPushSingle) {
          const logger = serviceProvider.get<ILogger>(TYPES.ILogger);
          const providerName = config.provider?.toLowerCase() || 'aws';
          const vaultInfo =
            providerName === 'azure' && config.vaultUrl
              ? `, vault=${new URL(config.vaultUrl).origin}`
              : '';
          const source = resolvedMap
            ? `configuration from ${resolvedMap}`
            : 'configuration';
          logger.info(`Using ${source}: provider=${providerName}${vaultInfo}`);
        }

        await executeWithSsoRecovery(() => executeCommand(resolvedOptions));
      },
    );

  registerExecCommand(program);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    // Only the exec subcommand overrides Commander's exit, so a parse error
    // reaching this point belongs to exec and uses its exit code. Commander
    // has already printed the message.
    if (error instanceof CommanderError) {
      if (error.exitCode === 0) {
        return;
      }
      throw new SilentExitError(EXEC_ENVILDER_FAILURE);
    }
    throw error;
  }
}

function registerExecCommand(program: Command): void {
  program
    .command('exec')
    .summary('Run a command with the resolved secrets in its environment')
    .description(
      'Resolve every secret declared in the map file and run <command> with ' +
        'those values in its environment, without writing anything to disk.\n\n' +
        'Envilder options come first. The command starts at the first ' +
        'argument that is not an Envilder option (or right after "--"), and ' +
        'everything from there on is passed to the command verbatim.',
    )
    .usage('[options] [--] <command> [args...]')
    .argument('[command]', 'Command to run')
    .argument('[args...]', 'Arguments passed to the command verbatim')
    .option(
      '--map <path>',
      `Path to the JSON file with environment variable mapping (default: ${DEFAULT_MAP_FILE})`,
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
    // Pull and push options are declared only to reject them with a clear
    // message instead of a generic "unknown option".
    .addOption(new Option('--envfile <path>').hideHelp())
    .addOption(new Option('--push').hideHelp())
    .addOption(new Option('--key <name>').hideHelp())
    .addOption(new Option('--value <value>').hideHelp())
    .addOption(new Option('--secret-path <path>').hideHelp())
    .addOption(new Option('--ssm-path <path>').hideHelp())
    .addHelpText('after', EXEC_HELP)
    .passThroughOptions()
    .exitOverride()
    .action(
      async (
        commandName: string | undefined,
        childArgs: string[] | undefined,
        options: ExecOptions,
        execCommand: Command,
      ) => {
        rejectRootOptionsBeforeExec(
          (execCommand.parent?.opts() ?? {}) as ExecOptions,
        );
        await runExec(commandName, childArgs ?? [], options);
      },
    );
}

const EXEC_HELP = `
Examples:
  envilder exec -- npm run dev
  envilder exec --map=config/envilder.json node server.js
  envilder exec --provider=azure --vault-url=https://my-vault.vault.azure.net -- dotnet run
  envilder exec -- -command-starting-with-dash

Exit codes:
  n      the command's own exit code
  128+n  the command was killed by signal n
  125    Envilder failed before starting the command (bad options, missing
         command, unresolved secrets, credentials)
  126    the command exists but cannot be executed
  127    the command was not found

Exec mode is fail-closed: the command never starts when a secret is missing,
empty or unreadable. Mapped values override inherited variables. No shell is
involved; use "envilder exec -- sh -c '...'" for shell features.
The command and everything it starts can read the secrets: exec mode is not
a sandbox. See docs/exec-command.md.`;

const EXEC_COMPATIBLE_ROOT_OPTIONS: ReadonlyArray<[keyof ExecOptions, string]> =
  [
    ['map', '--map'],
    ['profile', '--profile'],
    ['provider', '--provider'],
    ['vaultUrl', '--vault-url'],
  ];
const EXEC_INCOMPATIBLE_ROOT_OPTIONS: ReadonlyArray<
  [keyof ExecOptions, string]
> = [
  ['envfile', '--envfile'],
  ['push', '--push'],
  ['key', '--key'],
  ['value', '--value'],
  ['secretPath', '--secret-path'],
  ['ssmPath', '--ssm-path'],
];
const ROOT_FLAGS_WITH_VALUE = new Set([
  '--map',
  '--envfile',
  '--profile',
  '--provider',
  '--vault-url',
  '--key',
  '--value',
  '--secret-path',
  '--ssm-path',
]);

/**
 * Root options written before `exec` are parsed by the root command, which
 * exec never reads. Reject them instead of silently ignoring them. Options
 * exec supports are shown moved after `exec`; options it does not support
 * are named only, because their values (for example `--value`) can be
 * secrets and must never be echoed.
 */
function rejectRootOptionsBeforeExec(rootOptions: ExecOptions): void {
  const isSet = ([name]: [keyof ExecOptions, string]) =>
    rootOptions[name] !== undefined;
  const compatible = EXEC_COMPATIBLE_ROOT_OPTIONS.filter(isSet);
  const incompatible = EXEC_INCOMPATIBLE_ROOT_OPTIONS.filter(isSet);
  if (compatible.length === 0 && incompatible.length === 0) {
    return;
  }

  const lines: string[] = [];
  if (compatible.length > 0) {
    const suggestion = formatCommandLine([
      'envilder',
      'exec',
      ...compatible.map(([name, flag]) => `${flag}=${rootOptions[name]}`),
      ...argumentsAfterExec(process.argv.slice(2)),
    ]);
    lines.push(`error: Put envilder options after "exec": ${suggestion}`);
  } else {
    lines.push('error: Put envilder options after "exec".');
  }
  if (incompatible.length > 0) {
    const flags = incompatible.map(([, flag]) => flag).join(', ');
    lines.push(`${flags} cannot be used with exec.`);
  }
  console.error(pc.red(lines.join('\n')));
  throw new SilentExitError(EXEC_ENVILDER_FAILURE);
}

/**
 * Returns the arguments that follow the `exec` subcommand, skipping root
 * option values so a value spelled `exec` is not mistaken for it.
 */
function argumentsAfterExec(args: string[]): string[] {
  let index = 0;
  while (index < args.length && args[index] !== 'exec') {
    const token = args[index];
    index += ROOT_FLAGS_WITH_VALUE.has(token) ? 2 : 1;
  }
  return args.slice(index + 1);
}

async function runExec(
  commandName: string | undefined,
  childArgs: string[],
  options: ExecOptions,
): Promise<void> {
  const usageError = findExecUsageError(commandName, options);
  if (usageError !== undefined || commandName === undefined) {
    console.error(pc.red(`error: ${usageError}`));
    throw new SilentExitError(EXEC_ENVILDER_FAILURE);
  }

  let exitCode: number;
  try {
    exitCode = await resolveSecretsAndRun(commandName, childArgs, options);
  } catch (error) {
    throw new SilentExitError(reportExecFailure(error));
  }
  process.exitCode = exitCode;
}

function findExecUsageError(
  commandName: string | undefined,
  options: ExecOptions,
): string | undefined {
  if (options.envfile !== undefined) {
    return '--envfile cannot be used with exec: exec mode never reads or writes a .env file.';
  }
  if (options.push !== undefined) {
    return '--push cannot be used with exec.';
  }
  const singleSecretOptions = [
    options.key,
    options.value,
    options.secretPath,
    options.ssmPath,
  ];
  if (singleSecretOptions.some((option) => option !== undefined)) {
    return 'Single-secret push options cannot be used with exec.';
  }
  if (!commandName) {
    return `Missing command. Usage: ${EXEC_USAGE}`;
  }
  return undefined;
}

async function resolveSecretsAndRun(
  commandName: string,
  childArgs: string[],
  options: ExecOptions,
): Promise<number> {
  const mapPath = resolveMapFile(options.map) as string;
  const fileConfig = await readMapFileConfig(mapPath);
  const config: MapFileConfig = {
    ...fileConfig,
    ...(options.provider && { provider: options.provider }),
    ...(options.vaultUrl && { vaultUrl: options.vaultUrl }),
    ...(options.profile && { profile: options.profile }),
  };

  const container = Startup.build()
    .configureExec({ githubActions: process.env.GITHUB_ACTIONS === 'true' })
    .configureServices()
    .configureInfrastructure(config, {
      ...buildInfrastructureOptions(),
      identityBanner: false,
    })
    .create();
  const handler = container.get<ExecWithSecretsCommandHandler>(
    TYPES.ExecWithSecretsCommandHandler,
  );
  const command = ExecWithSecretsCommand.create(
    mapPath,
    commandName,
    childArgs,
    describeSecretSource(config),
  );

  // SSO recovery wraps only the resolution, so the child starts at most once.
  let prepared: PreparedExec | undefined;
  await executeWithSsoRecovery(
    async () => {
      prepared = await handler.prepare(command);
    },
    { confirm: createConfirm(process.stderr) },
  );
  if (prepared === undefined) {
    throw new InvalidArgumentError('Secrets could not be resolved.');
  }
  return handler.start(prepared);
}

function reportExecFailure(error: unknown): number {
  if (error instanceof SilentExitError) {
    // SSO recovery was declined or failed and already explained why.
    return EXEC_ENVILDER_FAILURE;
  }
  if (error instanceof CommandNotFoundError) {
    console.error(pc.red(error.message));
    return EXEC_COMMAND_NOT_FOUND;
  }
  if (error instanceof CommandNotExecutableError) {
    console.error(pc.red(error.message));
    return EXEC_COMMAND_NOT_EXECUTABLE;
  }
  console.error(presentError(error));
  return EXEC_ENVILDER_FAILURE;
}

function describeSecretSource(config: MapFileConfig): string {
  const provider = config.provider?.toLowerCase() || 'aws';
  if (provider === 'aws' && config.profile) {
    return `${provider}, profile=${config.profile}`;
  }
  if (provider === 'azure' && config.vaultUrl) {
    try {
      return `${provider}, vault=${new URL(config.vaultUrl).host}`;
    } catch {
      return provider;
    }
  }
  return provider;
}

function buildInfrastructureOptions(): Record<string, unknown> {
  const infraOptions: Record<string, unknown> = {};
  const extraHosts = process.env.ENVILDER_ALLOWED_VAULT_HOSTS;
  if (extraHosts) {
    infraOptions.allowedVaultHosts = extraHosts.split(',').map((h) => h.trim());
    infraOptions.disableChallengeResourceVerification = true;
  }
  return infraOptions;
}

function resolveMapFile(
  mapOption: string | undefined,
  options: { required: boolean } = { required: true },
): string | undefined {
  if (mapOption !== undefined) {
    const trimmed = mapOption.trim();
    if (trimmed.length === 0) {
      throw new InvalidArgumentError(
        'Invalid --map value: path must not be empty.',
      );
    }
    return trimmed;
  }

  const defaultPath = join(process.cwd(), DEFAULT_MAP_FILE);
  if (existsSync(defaultPath)) {
    return DEFAULT_MAP_FILE;
  }

  if (!options.required) {
    return undefined;
  }

  throw new InvalidArgumentError(
    `No map file found. Provide --map or create ${DEFAULT_MAP_FILE} in the current directory.`,
  );
}

function resolveEnvfile(envfileOption: string | undefined): string {
  if (envfileOption === undefined) {
    return DEFAULT_ENV_FILE;
  }

  const trimmed = envfileOption.trim();
  if (trimmed.length === 0) {
    throw new InvalidArgumentError(
      'Invalid --envfile value: path must not be empty.',
    );
  }

  return trimmed;
}

function readPackageVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '../../../../../package.json');

  return new PackageVersionReader().getVersion(packageJsonPath);
}
