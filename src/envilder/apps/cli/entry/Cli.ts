import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command, CommanderError, Option } from 'commander';
import type { Container } from 'inversify';
import pc from 'picocolors';
import { DispatchActionCommand } from '../../../core/application/dispatch/DispatchActionCommand.js';
import type { DispatchActionCommandHandler } from '../../../core/application/dispatch/DispatchActionCommandHandler.js';
import {
  formatArgument,
  formatProgram,
} from '../../../core/application/execWithSecrets/CommandLineFormatter.js';
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
import { resolveMapFileTarget } from '../../../core/domain/MapFileUpdate.js';
import { OperationMode } from '../../../core/domain/OperationMode.js';
import type { ILogger } from '../../../core/domain/ports/ILogger.js';
import type { ISecretMasker } from '../../../core/domain/ports/ISecretMasker.js';
import { GitHubActionsSecretMasker } from '../../../core/infrastructure/github/GitHubActionsSecretMasker.js';
import { NoOpSecretMasker } from '../../../core/infrastructure/github/NoOpSecretMasker.js';
import { PackageVersionReader } from '../../../core/infrastructure/package/PackageVersionReader.js';
import { readMapFileConfig } from '../../../core/infrastructure/variableStore/FileVariableStore.js';
import { TYPES } from '../../../core/types.js';
import { presentError } from '../errors/CliErrorPresenter.js';
import {
  type KnownOption,
  missingArgumentMessage,
  redactParseError,
} from '../errors/ParseErrorRedactor.js';
import { SilentExitError } from '../errors/SilentExitError.js';
import {
  createConfirm,
  createRunLogin,
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

  ${pc.red('>')} ${pc.bold('Push a single secret')}  ${pc.dim('(also records it in envilder.json)')}
    ${pc.cyan('envilder --key=API_KEY --value=s3cret --secret-path=/my/path')}
    ${pc.cyan('envilder --key=API_KEY --value=s3cret --secret-path=/my/path --no-map-update')}  ${pc.dim('# push only')}

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
    // Inherited by `exec`, which is created after this call.
    .configureOutput({
      // Parse errors can quote secrets typed by the user (#554).
      outputError: (message, write) =>
        write(redactParseError(message, knownOptionsOf(program))),
    })
    .option(
      '--map <path>',
      `Path to the JSON file with environment variable mapping (default: ${DEFAULT_MAP_FILE}); a single-secret push creates or updates it`,
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
    .option(
      '--no-map-update',
      `Single-secret push only: do not read, create or update the map file (by default the mapping is recorded in ${DEFAULT_MAP_FILE} or --map)`,
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
        const resolvedMap = isPushSingle
          ? resolveSingleSecretMapFile(options.map, options.mapUpdate)
          : resolveMapFile(options.map);
        const resolvedEnvfile = resolveEnvfile(options.envfile);

        // A single-secret push may name a map file that does not exist yet:
        // it is created once the push options are validated.
        const mapFileExists =
          resolvedMap !== undefined &&
          (!isPushSingle || existsSync(resolvedMap));
        const fileConfig =
          resolvedMap !== undefined && mapFileExists
            ? await readMapFileConfig(resolvedMap)
            : {};

        const config: MapFileConfig = {
          ...fileConfig,
          ...(provider && { provider }),
          ...(vaultUrl && { vaultUrl }),
          ...(options.profile && { profile: options.profile }),
        };

        const resolvedOptions: CliOptions = {
          ...options,
          map: resolvedMap,
          envfile: resolvedEnvfile,
          ...(isPushSingle &&
            resolvedMap !== undefined && {
              mapTarget: resolveMapFileTarget(config),
            }),
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
          const source = mapFileExists
            ? `configuration from ${resolvedMap}`
            : 'configuration';
          logger.info(`Using ${source}: provider=${providerName}${vaultInfo}`);
        }

        await executeWithSsoRecovery(() => executeCommand(resolvedOptions));
      },
    );

  registerExecCommand(program);
  rejectDashValues(program, 1);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof DashValueError) {
      // Same plain format as the parser's own errors.
      process.stderr.write(missingArgumentMessage(error.flags));
      throw new SilentExitError(error.exitCode);
    }
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

/**
 * The options a command registers, flagged with whether `--help` lists them,
 * so parse-error suggestions only ever name visible options of the command
 * being parsed.
 */
function knownOptionsOf(command: Command): KnownOption[] {
  const visible = command.createHelp().visibleOptions(command);
  const all = [...command.options, ...visible];
  const byFlags = new Map<string, KnownOption>();
  for (const option of all) {
    byFlags.set(option.flags, {
      flags: option.flags,
      long: option.long,
      visible: visible.includes(option),
    });
  }
  return [...byFlags.values()];
}

/**
 * Thrown by the option parser when a path or name option would take the next
 * option as its value, for example `--map --key=...`.
 */
class DashValueError extends Error {
  constructor(
    readonly flags: string,
    readonly exitCode: number,
  ) {
    super(`option '${flags}' argument missing`);
  }
}

const DASH_GUARDED_OPTIONS = new Set([
  '--map',
  '--envfile',
  '--profile',
  '--provider',
  '--vault-url',
  '--key',
  '--secret-path',
  '--ssm-path',
]);

/**
 * Path and name options never accept a value that starts with `-`: such a
 * value is almost always the next option, and accepting it would silently
 * swallow that option (and later echo it). `--value` is exempt because a
 * secret may legitimately start with `-`. One parser serves the root command
 * and `exec`.
 */
function rejectDashValues(command: Command, exitCode: number): void {
  for (const option of command.options) {
    if (!option.required || !DASH_GUARDED_OPTIONS.has(option.long ?? '')) {
      continue;
    }
    option.argParser((value: string) => {
      if (value.startsWith('-')) {
        throw new DashValueError(option.flags, exitCode);
      }
      return value;
    });
  }
}

function registerExecCommand(program: Command): void {
  const exec = program
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
        // Exec's own usage errors come first: their messages never echo
        // option values, unlike the root-option suggestion.
        const usageError = findExecUsageError(commandName, options);
        if (usageError !== undefined || commandName === undefined) {
          console.error(pc.red(`error: ${usageError}`));
          throw new SilentExitError(EXEC_ENVILDER_FAILURE);
        }
        rejectRootOptionsBeforeExec(
          (execCommand.parent?.opts() ?? {}) as ExecOptions,
          options,
          commandName,
          childArgs ?? [],
        );
        await runExec(commandName, childArgs ?? [], options);
      },
    );

  // Suggestions for exec's parse errors come from exec's own options.
  exec.configureOutput({
    outputError: (message, write) =>
      write(redactParseError(message, knownOptionsOf(exec))),
  });
  rejectDashValues(exec, EXEC_ENVILDER_FAILURE);
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
/**
 * Root options written before `exec` are parsed by the root command, which
 * exec never reads. Reject them instead of silently ignoring them. Options
 * exec supports are shown moved after `exec`; options it does not support
 * are named only, because their values (for example `--value`) can be
 * secrets. The command is shown by program name only: its arguments can
 * carry secrets too.
 */
function rejectRootOptionsBeforeExec(
  rootOptions: ExecOptions,
  execOptions: ExecOptions,
  commandName: string,
  childArgs: string[],
): void {
  const isSetIn =
    (options: ExecOptions) =>
    ([name]: [keyof ExecOptions, string]) =>
      options[name] !== undefined;
  const compatible = EXEC_COMPATIBLE_ROOT_OPTIONS.filter(isSetIn(rootOptions));
  const incompatible = EXEC_INCOMPATIBLE_ROOT_OPTIONS.filter(
    isSetIn(rootOptions),
  );
  if (compatible.length === 0 && incompatible.length === 0) {
    return;
  }

  const lines: string[] = [];
  if (compatible.length > 0) {
    const optionFor =
      (options: ExecOptions) =>
      ([name, flag]: [keyof ExecOptions, string]) =>
        formatArgument(`${flag}=${options[name]}`);
    const suggestion = [
      'envilder exec',
      ...compatible.map(optionFor(rootOptions)),
      ...EXEC_COMPATIBLE_ROOT_OPTIONS.filter(isSetIn(execOptions)).map(
        optionFor(execOptions),
      ),
      '--',
      formatProgram(commandName, childArgs),
    ].join(' ');
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

async function runExec(
  commandName: string,
  childArgs: string[],
  options: ExecOptions,
): Promise<void> {
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
  const mapPath = resolveMapFile(options.map);
  const fileConfig = await readMapFileConfig(mapPath);
  const config: MapFileConfig = {
    ...fileConfig,
    ...(options.provider && { provider: options.provider }),
    ...(options.vaultUrl && { vaultUrl: options.vaultUrl }),
    ...(options.profile && { profile: options.profile }),
  };

  const container = Startup.build()
    .configureExec(createExecSecretMasker())
    .configureServices()
    .configureInfrastructure(config, buildInfrastructureOptions())
    .create();
  const dispatcher = container.get<DispatchActionCommandHandler>(
    TYPES.DispatchActionCommandHandler,
  );
  const command = DispatchActionCommand.forExec(
    mapPath,
    commandName,
    childArgs,
    describeSecretSource(config),
  );

  // A write error on stdout or stderr (for example EPIPE on a mask
  // registration) also reaches the write callback, so the masker's flush
  // rejects and the child never starts. Without a listener the 'error' event
  // would crash Envilder.
  // The listener is never removed: the event can be emitted after exec has
  // already failed (for example when resolution rejects after some values
  // were masked), and exec is the last thing this process does, so keeping
  // it has no effect on pull or push.
  for (const stream of [process.stdout, process.stderr]) {
    if (!stream.listeners('error').includes(ignoreStreamError)) {
      stream.on('error', ignoreStreamError);
    }
  }
  return dispatchExec(dispatcher, command);
}

function ignoreStreamError(): void {}

async function dispatchExec(
  dispatcher: DispatchActionCommandHandler,
  command: DispatchActionCommand,
): Promise<number> {
  // An SSO session error can only be raised while resolving secrets, before
  // the child is spawned, so retrying the dispatch never starts it twice.
  let exitCode: number | undefined;
  await executeWithSsoRecovery(
    async () => {
      exitCode = await dispatcher.handleCommand(command);
    },
    {
      // Exec prompts on stderr, so stdout may be redirected for the child.
      isInteractive: () =>
        Boolean(process.stdin.isTTY) && Boolean(process.stderr.isTTY),
      confirm: createConfirm(process.stderr),
      runLogin: createRunLogin({ stdout: 'stderr' }),
    },
  );
  if (exitCode === undefined) {
    throw new InvalidArgumentError('Secrets could not be resolved.');
  }
  return exitCode;
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

/**
 * Exec writes mask registrations to stderr: the runner reads workflow
 * commands from both streams, and stdout belongs to the child.
 */
function createExecSecretMasker(): ISecretMasker {
  return process.env.GITHUB_ACTIONS === 'true'
    ? new GitHubActionsSecretMasker({ stream: process.stderr })
    : new NoOpSecretMasker();
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

/**
 * The map file a single-secret push records its mapping in: `--map`, or the
 * default in the current directory, which may not exist yet. `undefined` when
 * `--no-map-update` turns the map file off.
 */
function resolveSingleSecretMapFile(
  mapOption: string | undefined,
  mapUpdate: boolean | undefined,
): string | undefined {
  if (mapUpdate === false) {
    return undefined;
  }
  return mapOption === undefined ? DEFAULT_MAP_FILE : resolveMapFile(mapOption);
}

function resolveMapFile(mapOption: string | undefined): string {
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
