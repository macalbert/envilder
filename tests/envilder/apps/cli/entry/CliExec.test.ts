import { SSMClient } from '@aws-sdk/client-ssm';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import { main } from '../../../../../src/envilder/apps/cli/entry/Cli';
import { SilentExitError } from '../../../../../src/envilder/apps/cli/errors/SilentExitError';
import { Startup } from '../../../../../src/envilder/apps/cli/Startup';
import { DispatchActionCommandHandler } from '../../../../../src/envilder/core/application/dispatch/DispatchActionCommandHandler';
import {
  CommandNotExecutableError,
  CommandNotFoundError,
  EnvironmentTooLargeError,
  SsoSessionExpiredError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import { OperationMode } from '../../../../../src/envilder/core/domain/OperationMode';
import type { ProcessRequest } from '../../../../../src/envilder/core/domain/ports/IProcessRunner';
import { AwsSsmSecretProvider } from '../../../../../src/envilder/core/infrastructure/aws/AwsSsmSecretProvider';
import { AzureKeyVaultSecretProvider } from '../../../../../src/envilder/core/infrastructure/azure/AzureKeyVaultSecretProvider';
import { NoOpSecretMasker } from '../../../../../src/envilder/core/infrastructure/github/NoOpSecretMasker';
import { CrossSpawnProcessRunner } from '../../../../../src/envilder/core/infrastructure/process/CrossSpawnProcessRunner';
import { FileVariableStore } from '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore';

vi.mock(
  '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
  async () => {
    const actual = await vi.importActual(
      '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore',
    );
    return {
      ...(actual as object),
      readMapFileConfig: vi.fn().mockResolvedValue({}),
    };
  },
);

vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...(actual as object),
    existsSync: vi.fn().mockReturnValue(true),
  };
});

vi.mock(
  '../../../../../src/envilder/apps/cli/recovery/SsoLoginRecovery',
  async () => {
    const actual = await vi.importActual(
      '../../../../../src/envilder/apps/cli/recovery/SsoLoginRecovery',
    );
    return {
      ...(actual as object),
      executeWithSsoRecovery: vi.fn(),
    };
  },
);

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const DB_URL_PATH = '/app/dev/db-url';
const API_KEY_PATH = '/app/dev/api-key';
const DB_URL_VALUE = 'fake-db-url-value-7Qx2Lm9Rv4Tz8Kp1';
const API_KEY_VALUE = 'fake-api-key-value-3Hn6Wc1Ys5Jd0Bg7';
const USAGE_ERROR =
  'Missing command. Usage: envilder exec [options] [--] <command> [args...]';

class ProcessExitCalled extends Error {
  constructor(readonly code: number) {
    super(`process.exit(${code})`);
  }
}

/**
 * Models how the unchanged Index.ts entry point turns the outcome of main()
 * into a process exit code: process.exit(code) wins, SilentExitError exits
 * with its code, any other rejection exits with 1, and a normal return exits
 * with process.exitCode (0 when unset).
 */
async function runCli(args: string[]): Promise<number> {
  process.argv = ['node', 'envilder', ...args];
  return main().then(
    () => Number(process.exitCode ?? 0),
    (error: unknown) => {
      if (error instanceof ProcessExitCalled) {
        return error.code;
      }
      if (error instanceof SilentExitError) {
        return error.code;
      }
      return 1;
    },
  );
}

/** Completes a mocked stream write the way Node does: callback on next tick. */
function completeWrite(rest: unknown[], error?: Error): void {
  const callback = rest.find(
    (arg): arg is (error?: Error | null) => void => typeof arg === 'function',
  );
  process.nextTick(() => callback?.(error ?? null));
}

function strip(value: unknown): string {
  return String(value).replace(ANSI_PATTERN, '');
}

describe('Cli exec', () => {
  let secrets: Record<string, string | undefined>;
  let getMappingSpy: MockInstance;
  let getEnvironmentSpy: MockInstance;
  let saveEnvironmentSpy: MockInstance;
  let getSecretSpy: MockInstance;
  let runSpy: MockInstance;
  let logIdentitySpy: MockInstance;
  let stdoutChunks: string[];
  let stderrChunks: string[];

  function stdout(): string {
    return strip(stdoutChunks.join(''));
  }

  function stderr(): string {
    return strip(stderrChunks.join(''));
  }

  function runRequest(): ProcessRequest {
    return runSpy.mock.calls[0][0] as ProcessRequest;
  }

  beforeEach(async () => {
    secrets = { [DB_URL_PATH]: DB_URL_VALUE, [API_KEY_PATH]: API_KEY_VALUE };
    process.exitCode = undefined;
    vi.stubEnv('GITHUB_ACTIONS', undefined);
    vi.stubEnv('ENVILDER_ALLOWED_VAULT_HOSTS', undefined);
    vi.stubEnv('API_KEY', undefined);
    vi.stubEnv('DB_URL', undefined);

    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReset();
    vi.mocked(existsSync).mockReturnValue(true);
    const { readMapFileConfig } = await import(
      '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore'
    );
    vi.mocked(readMapFileConfig).mockReset();
    vi.mocked(readMapFileConfig).mockResolvedValue({});
    const { executeWithSsoRecovery } = await import(
      '../../../../../src/envilder/apps/cli/recovery/SsoLoginRecovery'
    );
    vi.mocked(executeWithSsoRecovery).mockReset();
    vi.mocked(executeWithSsoRecovery).mockImplementation(async (run) => {
      await run();
    });

    getMappingSpy = vi
      .spyOn(FileVariableStore.prototype, 'getMapping')
      .mockResolvedValue({ DB_URL: DB_URL_PATH, API_KEY: API_KEY_PATH });
    getEnvironmentSpy = vi
      .spyOn(FileVariableStore.prototype, 'getEnvironment')
      .mockResolvedValue({});
    saveEnvironmentSpy = vi
      .spyOn(FileVariableStore.prototype, 'saveEnvironment')
      .mockResolvedValue(undefined);
    getSecretSpy = vi
      .spyOn(AwsSsmSecretProvider.prototype, 'getSecret')
      .mockImplementation(async (name: string) => secrets[name]);
    logIdentitySpy = vi
      .spyOn(AwsSsmSecretProvider.prototype, 'logIdentity')
      .mockResolvedValue(undefined);
    vi.spyOn(
      AzureKeyVaultSecretProvider.prototype,
      'getSecret',
    ).mockImplementation(async (name: string) => secrets[name]);
    runSpy = vi
      .spyOn(CrossSpawnProcessRunner.prototype, 'run')
      .mockResolvedValue({ code: 0, signal: null });

    stdoutChunks = [];
    stderrChunks = [];
    const toStdout = (...args: unknown[]) => {
      stdoutChunks.push(`${args.map(String).join(' ')}\n`);
    };
    const toStderr = (...args: unknown[]) => {
      stderrChunks.push(`${args.map(String).join(' ')}\n`);
    };
    vi.spyOn(console, 'log').mockImplementation(toStdout);
    vi.spyOn(console, 'info').mockImplementation(toStdout);
    vi.spyOn(console, 'warn').mockImplementation(toStderr);
    vi.spyOn(console, 'error').mockImplementation(toStderr);
    vi.spyOn(process.stdout, 'write').mockImplementation(((
      chunk: unknown,
      ...rest: unknown[]
    ) => {
      stdoutChunks.push(String(chunk));
      completeWrite(rest);
      return true;
    }) as typeof process.stdout.write);
    vi.spyOn(process.stderr, 'write').mockImplementation(((
      chunk: unknown,
      ...rest: unknown[]
    ) => {
      stderrChunks.push(String(chunk));
      completeWrite(rest);
      return true;
    }) as typeof process.stderr.write);
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new ProcessExitCalled(code ?? 0);
    }) as typeof process.exit);
  });

  afterEach(() => {
    process.exitCode = undefined;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('command parsing', () => {
    it('Should_StartCommandAtFirstNonOption_When_SeparatorIsOmitted', async () => {
      // Act
      await runCli(['exec', '--map=cfg.json', 'npm', 'run', 'dev']);

      // Assert
      expect(getMappingSpy).toHaveBeenCalledWith('cfg.json');
      expect(runRequest().command).toBe('npm');
      expect(runRequest().args).toEqual(['run', 'dev']);
    });

    it('Should_StartCommandAfterSeparator_When_SeparatorIsPresent', async () => {
      // Act
      await runCli(['exec', '--map', 'cfg.json', '--', 'npm', 'run', 'dev']);

      // Assert
      expect(getMappingSpy).toHaveBeenCalledWith('cfg.json');
      expect(runRequest().command).toBe('npm');
      expect(runRequest().args).toEqual(['run', 'dev']);
    });

    it('Should_PassArgumentsVerbatim_When_CommandHasArguments', async () => {
      // Act
      await runCli([
        'exec',
        '--',
        'node',
        'app.js',
        '--port',
        '3000',
        '$DB_URL',
      ]);

      // Assert
      expect(runRequest().command).toBe('node');
      expect(runRequest().args).toEqual([
        'app.js',
        '--port',
        '3000',
        '$DB_URL',
      ]);
    });

    it('Should_PassLaterOptionsToChild_When_TheyFollowTheCommand', async () => {
      // Act
      await runCli(['exec', 'node', 'app.js', '--map', 'foo', '--push']);

      // Assert
      expect(getMappingSpy).toHaveBeenCalledWith('envilder.json');
      expect(runRequest().command).toBe('node');
      expect(runRequest().args).toEqual(['app.js', '--map', 'foo', '--push']);
    });

    it('Should_AllowDashedCommand_When_CommandFollowsSeparator', async () => {
      // Act
      await runCli(['exec', '--', '-weird-program-name', '--flag']);

      // Assert
      expect(runRequest().command).toBe('-weird-program-name');
      expect(runRequest().args).toEqual(['--flag']);
    });

    it('Should_ApplyProfileOverride_When_ProfileOptionIsProvided', async () => {
      // Arrange
      const infraSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

      // Act
      await runCli(['exec', '--profile', 'dev', 'node', 'app.js']);

      // Assert
      expect(infraSpy).toHaveBeenCalledWith(
        expect.objectContaining({ profile: 'dev' }),
        expect.any(Object),
      );
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it('Should_ApplyProviderAndVaultUrlOverrides_When_OptionsAreProvided', async () => {
      // Arrange
      const infraSpy = vi.spyOn(Startup.prototype, 'configureInfrastructure');

      // Act
      await runCli([
        'exec',
        '--provider=azure',
        '--vault-url=https://my-vault.vault.azure.net',
        'dotnet',
        'run',
      ]);

      // Assert
      expect(infraSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'azure',
          vaultUrl: 'https://my-vault.vault.azure.net',
        }),
        expect.any(Object),
      );
      expect(runRequest().command).toBe('dotnet');
    });

    it.each([
      ['NoArguments', ['exec']],
      ['OnlySeparator', ['exec', '--']],
      ['OnlyEnvilderOptions', ['exec', '--map=cfg.json']],
    ])(
      'Should_FailWithUsage_When_CommandIsMissingWith%s',
      async (_name, args) => {
        // Act
        const actual = await runCli(args);

        // Assert
        expect(actual).toBe(125);
        expect(stderr()).toContain(USAGE_ERROR);
        expect(getSecretSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it('Should_FailWithUnknownOption_When_UnknownOptionPrecedesCommand', async () => {
      // Act
      const actual = await runCli([
        'exec',
        '--mapp=cfg.json',
        'node',
        'app.js',
      ]);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toMatch(/unknown option '?--mapp/i);
      expect(getSecretSpy).not.toHaveBeenCalled();
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_RejectEnvfileOption_When_ExecModeIsUsed', async () => {
      // Act
      const actual = await runCli([
        'exec',
        '--envfile',
        '.env',
        'node',
        'app.js',
      ]);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain(
        '--envfile cannot be used with exec: exec mode never reads or writes a .env file.',
      );
      expect(getSecretSpy).not.toHaveBeenCalled();
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_RejectPushOptions_When_ExecModeIsUsed', async () => {
      // Act
      const actual = await runCli(['exec', '--push', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain('--push cannot be used with exec.');
      expect(getSecretSpy).not.toHaveBeenCalled();
      expect(runSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['Key', ['--key', 'API_KEY']],
      ['Value', ['--value', 'secret']],
      ['SecretPath', ['--secret-path', '/my/path']],
      ['SsmPath', ['--ssm-path', '/my/path']],
    ])(
      'Should_RejectSingleSecretPushOption_When_ExecModeIsUsedWith%s',
      async (_name, option) => {
        // Act
        const actual = await runCli(['exec', ...option, 'node', 'app.js']);

        // Assert
        expect(actual).toBe(125);
        expect(stderr()).toContain(
          'Single-secret push options cannot be used with exec.',
        );
        expect(getSecretSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it('Should_ExitWith125_When_NoMapFileIsFound', async () => {
      // Arrange
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      // Act
      const actual = await runCli(['exec', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain(
        'No map file found. Provide --map or create envilder.json in the current directory.',
      );
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('root options before exec', () => {
    it.each([
      ['MapSeparated', ['--map', 'config/prod.json']],
      ['MapInline', ['--map=config/prod.json']],
      ['Profile', ['--profile', 'dev']],
      ['Provider', ['--provider', 'aws']],
      ['VaultUrl', ['--vault-url', 'https://my-vault.vault.azure.net']],
      ['Envfile', ['--envfile', '.env']],
      ['Push', ['--push']],
      ['Key', ['--key', 'API_KEY']],
      ['Value', ['--value', 'secret']],
      ['SecretPath', ['--secret-path', '/my/path']],
      ['SsmPath', ['--ssm-path', '/my/path']],
    ])(
      'Should_RejectWith125_When_RootOptionPrecedesExecWith%s',
      async (_name, option) => {
        // Arrange
        const dispatchSpy = vi
          .spyOn(DispatchActionCommandHandler.prototype, 'handleCommand')
          .mockResolvedValue(undefined);

        // Act
        const actual = await runCli([...option, 'exec', '--', 'npm', 'start']);

        // Assert
        expect(actual).toBe(125);
        expect(stderr()).toContain('Put envilder options after "exec"');
        expect(getMappingSpy).not.toHaveBeenCalled();
        expect(getSecretSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
        expect(dispatchSpy).not.toHaveBeenCalled();
      },
    );
  });

  describe('root option suggestions', () => {
    it('Should_NotPrintChildArguments_When_RootOptionSuggestionIsShown', async () => {
      // Arrange
      const bearer = 'tok-SECRET-3Vn7Lw';

      // Act
      const actual = await runCli([
        '--map=cfg.json',
        'exec',
        '--',
        'curl',
        '-H',
        `Authorization: Bearer ${bearer}`,
        'https://api.example.test/v1',
      ]);

      // Assert
      const output = `${stdout()}${stderr()}`;
      expect(actual).toBe(125);
      expect(stderr()).toContain('envilder exec --map=cfg.json');
      expect(stderr()).toContain('curl');
      expect(output).not.toContain(bearer);
      expect(output).not.toContain('Authorization');
      expect(output).not.toContain('https://api.example.test/v1');
      expect(runSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['ValueInline', ['--value=s3cretVALUE-9Zq4Wx'], 's3cretVALUE-9Zq4Wx'],
      [
        'ValueSeparated',
        ['--value', 's3cretVALUE-9Zq4Wx'],
        's3cretVALUE-9Zq4Wx',
      ],
      ['Key', ['--key', 'KEYNAME-4Rt8Lp'], 'KEYNAME-4Rt8Lp'],
      [
        'SecretPath',
        ['--secret-path', '/hidden/path-6Yb3Nc'],
        '/hidden/path-6Yb3Nc',
      ],
      ['SsmPath', ['--ssm-path', '/hidden/ssm-2Kd7Vf'], '/hidden/ssm-2Kd7Vf'],
      ['Envfile', ['--envfile', 'private-1Mx5Qa.env'], 'private-1Mx5Qa.env'],
    ])(
      'Should_NotEchoExecOptionValue_When_RootOptionPrecedesExecAndExecHas%s',
      async (_name, execOption, hiddenValue) => {
        // Act
        const actual = await runCli([
          '--map=cfg.json',
          'exec',
          ...execOption,
          'node',
          'app.js',
        ]);

        // Assert
        expect(actual).toBe(125);
        expect(stderr()).not.toContain(hiddenValue);
        expect(stdout()).not.toContain(hiddenValue);
        expect(getSecretSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['Inline', ['--value=s3cretVALUE-9Zq4Wx']],
      ['Separated', ['--value', 's3cretVALUE-9Zq4Wx']],
    ])(
      'Should_NotEchoSecretValue_When_ValueOptionPrecedesExecWith%sForm',
      async (_name, option) => {
        // Act
        const actual = await runCli([
          ...option,
          'exec',
          '--',
          'node',
          '-e',
          '1',
        ]);

        // Assert
        expect(actual).toBe(125);
        expect(stderr()).toContain('Put envilder options after "exec"');
        expect(stderr()).not.toContain('s3cretVALUE-9Zq4Wx');
        expect(stdout()).not.toContain('s3cretVALUE-9Zq4Wx');
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it('Should_SuggestActionableCommand_When_CompatibleRootOptionPrecedesExec', async () => {
      // Act
      const actual = await runCli([
        '--map=cfg.json',
        'exec',
        '--',
        'npm',
        'start',
      ]);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain('envilder exec --map=cfg.json');
    });

    it.each([
      ['Envfile', ['--envfile', '.env'], '--envfile'],
      ['Push', ['--push'], '--push'],
      ['Key', ['--key', 'API_KEY'], '--key'],
      ['Value', ['--value', 'secret'], '--value'],
      ['SecretPath', ['--secret-path', '/my/path'], '--secret-path'],
      ['SsmPath', ['--ssm-path', '/my/path'], '--ssm-path'],
    ])(
      'Should_NotSuggestIncompatibleOption_When_%sPrecedesExec',
      async (_name, option, flag) => {
        // Act
        const actual = await runCli([...option, 'exec', '--', 'npm', 'start']);

        // Assert
        expect(actual).toBe(125);
        expect(stderr()).not.toContain(`envilder exec ${flag}`);
        expect(stderr()).toContain(flag);
        expect(stderr()).toContain('cannot be used with exec');
        expect(runSpy).not.toHaveBeenCalled();
      },
    );
  });

  describe('windows case collisions', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    });

    it('Should_ExitWith125_When_MapNamesDifferOnlyByCaseOnWindows', async () => {
      // Arrange
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true,
      });
      getMappingSpy.mockResolvedValue({
        Path: DB_URL_PATH,
        PATH: API_KEY_PATH,
      });

      // Act
      const actual = await runCli(['exec', '--', 'cmd', '/c', 'echo']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain('Path');
      expect(stderr()).toContain('PATH');
      expect(stderr()).toContain('differ only by case');
      expect(getSecretSpy).not.toHaveBeenCalled();
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('aws identity', () => {
    beforeEach(() => {
      getSecretSpy.mockRestore();
      vi.spyOn(SSMClient.prototype, 'send').mockImplementation(
        (async (command: { input: { Name: string } }) => ({
          Parameter: { Value: secrets[command.input.Name] },
        })) as never,
      );
    });

    it('Should_NotPrintAwsIdentity_When_ExecModeResolvesSecrets', async () => {
      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(0);
      expect(runRequest().env).toMatchObject({
        DB_URL: DB_URL_VALUE,
        API_KEY: API_KEY_VALUE,
      });
      expect(logIdentitySpy).not.toHaveBeenCalled();
      expect(`${stdout()}${stderr()}`).not.toContain('AWS identity');
    });
  });

  describe('parse errors never echo option values (#554)', () => {
    const GENERIC_UNKNOWN_OPTION =
      'error: unknown option. Run envilder --help.';
    let dispatchSpy: MockInstance;

    /** Exact line for a near-typo of a registered option. */
    function suggestedLine(flag: string, suggestion: string): RegExp {
      return new RegExp(
        `(^|\\n)error: unknown option '${flag}' \\(Did you mean ${suggestion}\\?\\)(\\n|$)`,
      );
    }

    /** Exact line for a single-character short option. */
    function shortOptionLine(flag: string): RegExp {
      return new RegExp(`(^|\\n)error: unknown option '${flag}'(\\n|$)`);
    }

    beforeEach(() => {
      dispatchSpy = vi
        .spyOn(DispatchActionCommandHandler.prototype, 'handleCommand')
        .mockResolvedValue(undefined);
    });

    it('Should_NotEchoValue_When_UnknownOptionHasInlineValue', async () => {
      // Arrange
      const secret = 's3cretVALUE-root-6Gk2Pz';

      // Act
      const actual = await runCli([
        `--valeu=${secret}`,
        '--key=API_KEY',
        '--secret-path=/app/api-key',
      ]);

      // Assert
      expect(actual).toBe(1);
      expect(stderr()).toMatch(suggestedLine('--valeu', '--value'));
      expect(stderr()).not.toContain(secret);
      expect(stdout()).not.toContain(secret);
      expect(getSecretSpy).not.toHaveBeenCalled();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('Should_KeepUnknownOptionMessage_When_UnknownOptionHasNoValue', async () => {
      // Act
      const actual = await runCli(['--valeu']);

      // Assert
      expect(actual).toBe(1);
      expect(stderr()).toMatch(suggestedLine('--valeu', '--value'));
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('Should_SuggestRegisteredOption_When_ExecOptionIsNearTypo', async () => {
      // Act
      const actual = await runCli(['exec', '--mapp=cfg.json', 'node']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toMatch(suggestedLine('--mapp', '--map'));
      expect(stderr()).not.toContain('cfg.json');
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_SuggestRegisteredOption_When_ValueContainsQuote', async () => {
      // Arrange
      const secret = 'SECRET2-4Kd';

      // Act
      const actual = await runCli([`--valeu=ab'${secret}`]);

      // Assert
      expect(actual).toBe(1);
      expect(stderr()).toMatch(suggestedLine('--valeu', '--value'));
      expect(stderr()).not.toContain(secret);
      expect(stdout()).not.toContain(secret);
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['Root', ['-xSECRET4-2Pq'], 'SECRET4-2Pq', '-x', 1],
      ['Exec', ['exec', '-zSECRETc-5Tr', 'node'], 'SECRETc-5Tr', '-z', 125],
    ] as const)(
      'Should_PrintOnlyShortOptionCharacter_When_%sShortOptionHasAttachedValue',
      async (_name, args, secret, flag, expectedCode) => {
        // Act
        const actual = await runCli([...args]);

        // Assert
        expect(actual).toBe(expectedCode);
        expect(stderr()).toMatch(shortOptionLine(flag));
        expect(stderr()).not.toContain(secret);
        expect(stdout()).not.toContain(secret);
        expect(getSecretSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['RootQuoteInsideName', ["--va'leu=SECRET3-7Nw"], 'SECRET3-7Nw', 1],
      ['RootNameStartsWithQuote', ["--'abc=SECRET5-9Vx"], 'SECRET5-9Vx', 1],
      ['RootBadName', ['--bad=SECRET6-3Wy'], 'SECRET6-3Wy', 1],
      ['RootFooName', ['--foo=SECRET7-1Ju'], 'SECRET7-1Ju', 1],
      ['RootSingleLetterName', ['--a=b=SECRET8-6Ko'], 'SECRET8-6Ko', 1],
      ['RootNameThenQuote', ["--x'SECRET9-2Lm"], 'SECRET9-2Lm', 1],
      [
        'ExecInlineValue',
        ['exec', '--vaule=s3cretVALUE-exec-1Tq8Wd', 'node', 'app.js'],
        's3cretVALUE-exec-1Tq8Wd',
        125,
      ],
      [
        'ExecValueWithQuote',
        ['exec', "--vaule=x'SECRETb-8Hm", 'node'],
        'SECRETb-8Hm',
        125,
      ],
      ['ExecNoValue', ['exec', '--vaule', 'node', 'app.js'], 'vaule', 125],
    ] as const)(
      'Should_PrintGenericUnknownOption_When_%sHasNoSuggestion',
      async (_name, args, secret, expectedCode) => {
        // Act
        const actual = await runCli([...args]);

        // Assert
        expect(actual).toBe(expectedCode);
        expect(stderr()).toContain(GENERIC_UNKNOWN_OPTION);
        expect(stderr()).not.toContain("unknown option '");
        expect(stderr()).not.toContain(secret);
        expect(stdout()).not.toContain(secret);
        expect(getSecretSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['Root', ['--tokenS3CRETx9'], 1],
      ['Exec', ['exec', '--ZQXS3CRETx9', 'node'], 125],
    ] as const)(
      'Should_PrintGenericUnknownOption_When_NameIsNotNearAnyOption%s',
      async (_name, args, expectedCode) => {
        // Act
        const actual = await runCli([...args]);

        // Assert
        expect(actual).toBe(expectedCode);
        expect(stderr()).toContain(GENERIC_UNKNOWN_OPTION);
        expect(stderr()).not.toContain('S3CRETx9');
        expect(stdout()).not.toContain('S3CRETx9');
        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it('Should_NotEchoValue_When_RootReceivesExcessArgument', async () => {
      // Arrange
      const secret = 's3cretVALUE-arg-9Hc4Mv';

      // Act
      const actual = await runCli([`TOKEN=${secret}`]);

      // Assert
      expect(actual).toBe(1);
      expect(stderr()).toMatch(
        /(^|\n)error: too many arguments\. Expected 0 arguments but got 1\.(\n|$)/,
      );
      expect(stderr()).not.toContain(secret);
      expect(stdout()).not.toContain(secret);
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('Should_NotEchoValue_When_OptionArgumentIsMissing', async () => {
      // Arrange
      const secret = 's3cretVALUE-missing-3Rf7Ny';

      // Act
      const actual = await runCli([`--value=${secret}`, '--key']);

      // Assert
      expect(actual).toBe(1);
      expect(stderr()).not.toContain(secret);
      expect(stdout()).not.toContain(secret);
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('Should_NotEchoValue_When_ExecOptionArgumentIsMissing', async () => {
      // Arrange
      const secret = 's3cretVALUE-execmissing-5Lb0Qs';

      // Act
      const actual = await runCli(['exec', `--profile=${secret}`, '--map']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).not.toContain(secret);
      expect(stdout()).not.toContain(secret);
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('value-taking options never swallow the next option', () => {
    let dispatchSpy: MockInstance;

    beforeEach(() => {
      dispatchSpy = vi
        .spyOn(DispatchActionCommandHandler.prototype, 'handleCommand')
        .mockResolvedValue(undefined);
    });

    it.each([
      ['MapSeparated', ['--map', '--key=S3CRETx1'], '--map <path>', 'S3CRETx1'],
      ['MapInline', ['--map=--key=S3CRETx2'], '--map <path>', 'S3CRETx2'],
      [
        'Envfile',
        ['--envfile', '--key=S3CRETx5'],
        '--envfile <path>',
        'S3CRETx5',
      ],
      [
        'Profile',
        ['--profile', '--key=S3CRETx6'],
        '--profile <name>',
        'S3CRETx6',
      ],
      [
        'Provider',
        ['--provider', '--key=S3CRETx7'],
        '--provider <name>',
        'S3CRETx7',
      ],
      [
        'VaultUrl',
        ['--vault-url', '--key=S3CRETx8'],
        '--vault-url <url>',
        'S3CRETx8',
      ],
      [
        'SecretPath',
        ['--secret-path', '--key=S3CRETx9'],
        '--secret-path <path>',
        'S3CRETx9',
      ],
      [
        'SsmPath',
        ['--ssm-path', '--key=S3CRETy1'],
        '--ssm-path <path>',
        'S3CRETy1',
      ],
      ['Key', ['--key', '--map=S3CRETy2'], '--key <name>', 'S3CRETy2'],
    ] as const)(
      'Should_RejectDashValue_When_Root%sIsFollowedByAnotherOption',
      async (_name, args, flags, marker) => {
        // Arrange
        const { readMapFileConfig } = await import(
          '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore'
        );

        // Act
        const actual = await runCli([...args]);

        // Assert
        expect(actual).toBe(1);
        expect(stderr()).toContain(`error: option '${flags}' argument missing`);
        expect(stderr()).not.toContain(marker);
        expect(stdout()).not.toContain(marker);
        expect(readMapFileConfig).not.toHaveBeenCalled();
        expect(getMappingSpy).not.toHaveBeenCalled();
        expect(dispatchSpy).not.toHaveBeenCalled();
      },
    );

    it.each([
      [
        'MapSeparated',
        ['exec', '--map', '--key=S3CRETx3', 'node'],
        '--map <path>',
        'S3CRETx3',
      ],
      [
        'ProfileShortLike',
        ['exec', '--profile', '-zS3CRETx4', 'node'],
        '--profile <name>',
        'S3CRETx4',
      ],
      [
        'MapInline',
        ['exec', '--map=--key=S3CRETy3', 'node'],
        '--map <path>',
        'S3CRETy3',
      ],
    ] as const)(
      'Should_RejectDashValue_When_Exec%sIsFollowedByAnotherOption',
      async (_name, args, flags, marker) => {
        // Arrange
        const { readMapFileConfig } = await import(
          '../../../../../src/envilder/core/infrastructure/variableStore/FileVariableStore'
        );

        // Act
        const actual = await runCli([...args]);

        // Assert
        expect(actual).toBe(125);
        expect(stderr()).toContain(`error: option '${flags}' argument missing`);
        expect(stderr()).not.toContain(marker);
        expect(stdout()).not.toContain(marker);
        expect(readMapFileConfig).not.toHaveBeenCalled();
        expect(getMappingSpy).not.toHaveBeenCalled();
        expect(runSpy).not.toHaveBeenCalled();
      },
    );

    it('Should_AcceptValueStartingWithDash_When_PushingSingleSecret', async () => {
      // Act
      const actual = await runCli([
        '--key=K',
        '--value=-startsWithDash',
        '--secret-path=/p',
      ]);

      // Assert
      expect(actual).toBe(0);
      expect(stderr()).not.toContain('argument missing');
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: OperationMode.PUSH_SINGLE,
          key: 'K',
          value: '-startsWithDash',
          secretPath: '/p',
        }),
      );
    });
  });

  describe('root command compatibility', () => {
    it('Should_DispatchPull_When_RootCommandHasNoSubcommand', async () => {
      // Arrange
      const dispatchSpy = vi
        .spyOn(DispatchActionCommandHandler.prototype, 'handleCommand')
        .mockResolvedValue(undefined);

      // Act
      await runCli(['--map', 'map.json', '--envfile', '.env']);

      // Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ mode: OperationMode.PULL_SECRETS_TO_ENV }),
      );
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_DispatchPush_When_RootCommandHasPushFlag', async () => {
      // Arrange
      const dispatchSpy = vi
        .spyOn(DispatchActionCommandHandler.prototype, 'handleCommand')
        .mockResolvedValue(undefined);

      // Act
      await runCli(['--push']);

      // Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ mode: OperationMode.PUSH_ENV_TO_SECRETS }),
      );
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('exit codes', () => {
    it('Should_PropagateChildExitCode_When_ChildExits', async () => {
      // Arrange
      runSpy.mockResolvedValue({ code: 3, signal: null });

      // Act
      const actual = await runCli([
        'exec',
        '--',
        'node',
        '-e',
        'process.exit(3)',
      ]);

      // Assert
      expect(actual).toBe(3);
    });

    it('Should_ExitWithZero_When_ChildSucceeds', async () => {
      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(0);
    });

    it('Should_ExitWith128PlusSignal_When_ChildIsKilledBySignal', async () => {
      // Arrange
      runSpy.mockResolvedValue({ code: null, signal: 'SIGKILL' });

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(137);
    });

    it('Should_ExitWith127_When_CommandIsNotFound', async () => {
      // Arrange
      runSpy.mockRejectedValue(new CommandNotFoundError('nonexistent-cmd'));

      // Act
      const actual = await runCli(['exec', '--', 'nonexistent-cmd']);

      // Assert
      expect(actual).toBe(127);
      expect(stderr()).toContain('Command not found: nonexistent-cmd');
      expect(getSecretSpy).toHaveBeenCalled();
    });

    it('Should_ExitWith125_When_EnvironmentIsTooLarge', async () => {
      // Arrange
      runSpy.mockRejectedValue(new EnvironmentTooLargeError());

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain(
        'Environment too large to start the command (E2BIG).',
      );
    });

    it('Should_ExitWith126_When_CommandIsNotExecutable', async () => {
      // Arrange
      runSpy.mockRejectedValue(new CommandNotExecutableError('./script.sh'));

      // Act
      const actual = await runCli(['exec', '--', './script.sh']);

      // Assert
      expect(actual).toBe(126);
      expect(stderr()).toContain('Permission denied: ./script.sh');
    });

    it('Should_ExitWith125_When_EnvilderFailsBeforeSpawn', async () => {
      // Arrange
      secrets[API_KEY_PATH] = undefined;

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain('GAME OVER');
      expect(stderr()).toContain('API_KEY');
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_ExitWith125_When_ValueContainsNulByte', async () => {
      // Arrange
      secrets[DB_URL_PATH] = 'before\0after';

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(stderr()).toContain(
        'Secret for DB_URL contains a NUL byte and cannot be passed as an environment variable.',
      );
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_ExitWith125_When_SsoRecoveryIsDeclined', async () => {
      // Arrange
      const { executeWithSsoRecovery } = await import(
        '../../../../../src/envilder/apps/cli/recovery/SsoLoginRecovery'
      );
      vi.mocked(executeWithSsoRecovery).mockRejectedValue(
        new SilentExitError(1),
      );

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('sso error after the child started', () => {
    beforeEach(async () => {
      const { executeWithSsoRecovery } = await import(
        '../../../../../src/envilder/apps/cli/recovery/SsoLoginRecovery'
      );
      vi.mocked(executeWithSsoRecovery).mockImplementation(async (run) => {
        try {
          await run();
        } catch (error) {
          if (!(error instanceof SsoSessionExpiredError)) {
            throw error;
          }
          await run();
        }
      });
    });

    it('Should_NotRetryOrRestartChild_When_SsoErrorIsRaisedAfterSpawn', async () => {
      // Arrange
      runSpy.mockRejectedValue(new SsoSessionExpiredError('dev'));

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(runSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('sso recovery', () => {
    beforeEach(async () => {
      const { executeWithSsoRecovery } = await import(
        '../../../../../src/envilder/apps/cli/recovery/SsoLoginRecovery'
      );
      vi.mocked(executeWithSsoRecovery).mockImplementation(async (run) => {
        try {
          await run();
        } catch (error) {
          if (!(error instanceof SsoSessionExpiredError)) {
            throw error;
          }
          await run();
        }
      });
      getSecretSpy.mockRejectedValueOnce(new SsoSessionExpiredError('dev'));
    });

    it('Should_RetryAndStartChild_When_SsoRecoverySucceeds', async () => {
      // Arrange
      runSpy.mockResolvedValue({ code: 4, signal: null });

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(4);
      expect(runRequest().env).toMatchObject({
        DB_URL: DB_URL_VALUE,
        API_KEY: API_KEY_VALUE,
      });
    });

    it('Should_ResolveOnlyOnce_When_SsoRecoveryRetries', async () => {
      // Act
      await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(runSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('output and secret hygiene', () => {
    it('Should_NotPrintChildArguments_When_SummaryIsLogged', async () => {
      // Arrange
      const bearer = 'tok-SECRET-8Hf2Kq';
      const childArgs = [
        '-H',
        `Authorization: Bearer ${bearer}`,
        'https://api.example.test/v1',
      ];

      // Act
      const actual = await runCli(['exec', '--', 'curl', ...childArgs]);

      // Assert
      const output = `${stdout()}${stderr()}`;
      expect(actual).toBe(0);
      expect(stderr()).toContain('\u2192 curl');
      expect(output).not.toContain(bearer);
      expect(output).not.toContain('Authorization');
      expect(output).not.toContain('https://api.example.test/v1');
      expect(runRequest().command).toBe('curl');
      expect(runRequest().args).toEqual(childArgs);
    });

    it('Should_WriteEnvilderOutputToStderr_When_ExecModeIsUsed', async () => {
      // Arrange
      vi.stubEnv('API_KEY', 'from-shell');

      // Act
      await runCli(['exec', '--', 'npm', 'run', 'dev']);

      // Assert
      expect(stdout()).toBe('');
      expect(stderr()).toContain('Overriding inherited variables: API_KEY');
      expect(stderr()).toContain('resolved');
    });

    it('Should_NotPrintBanner_When_ExecModeIsUsed', async () => {
      // Act
      await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(`${stdout()}${stderr()}`).not.toContain('WORLD 1-1');
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it('Should_NotLogCompleteSecretValues_When_ExecSucceeds', async () => {
      // Act
      await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      const output = `${stdout()}${stderr()}`;
      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(output).not.toContain(DB_URL_VALUE);
      expect(output).not.toContain(API_KEY_VALUE);
    });

    it('Should_NotLogCompleteSecretValues_When_ExecFails', async () => {
      // Arrange
      secrets[API_KEY_PATH] = undefined;

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(`${stdout()}${stderr()}`).not.toContain(DB_URL_VALUE);
    });

    it('Should_RegisterSecretsWithMasker_When_RunningInGitHubActions', async () => {
      // Arrange
      vi.stubEnv('GITHUB_ACTIONS', 'true');

      // Act
      await runCli(['exec', '--', 'npm', 'test']);

      // Assert
      const stderrWrites = vi.mocked(process.stderr.write);
      const maskWriteOrders = stderrWrites.mock.calls
        .map((call, index) => ({
          text: String(call[0]),
          order: stderrWrites.mock.invocationCallOrder[index],
        }))
        .filter(({ text }) => text.startsWith('::add-mask::'));
      expect(maskWriteOrders.map(({ text }) => text)).toEqual(
        expect.arrayContaining([
          `::add-mask::${DB_URL_VALUE}\n`,
          `::add-mask::${API_KEY_VALUE}\n`,
        ]),
      );
      expect(
        Math.max(...maskWriteOrders.map(({ order }) => order)),
      ).toBeLessThan(runSpy.mock.invocationCallOrder[0]);
      expect(stdout()).toBe('');
    });

    it('Should_NotWriteMaskCommandsToStdout_When_ExecRunsInGitHubActions', async () => {
      // Arrange
      vi.stubEnv('GITHUB_ACTIONS', 'true');

      // Act
      const actual = await runCli(['exec', '--', 'node', 'print.js']);

      // Assert
      expect(actual).toBe(0);
      expect(stdout()).not.toContain('::add-mask::');
      expect(stderr()).toContain(`::add-mask::${DB_URL_VALUE}`);
      expect(stderr()).toContain(`::add-mask::${API_KEY_VALUE}`);
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it('Should_NotEmitMaskCommands_When_NotRunningInGitHubActions', async () => {
      // Act
      await runCli(['exec', '--', 'npm', 'test']);

      // Assert
      expect(stdout()).not.toContain('::add-mask::');
      expect(stderr()).not.toContain('::add-mask::');
      expect(runSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('masker flush', () => {
    it('Should_ExitWith125_When_MaskRegistrationWriteFailsInGitHubActions', async () => {
      // Arrange
      vi.stubEnv('GITHUB_ACTIONS', 'true');
      const writeError = Object.assign(new Error('write EPIPE'), {
        code: 'EPIPE',
      });
      vi.mocked(process.stderr.write).mockImplementation(((
        chunk: unknown,
        ...rest: unknown[]
      ) => {
        stderrChunks.push(String(chunk));
        completeWrite(rest, writeError);
        return true;
      }) as typeof process.stderr.write);

      // Act
      const actual = await runCli(['exec', '--', 'npm', 'test']);

      // Assert
      expect(actual).toBe(125);
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('Should_ExitWith125_When_MaskerFlushFails', async () => {
      // Arrange
      vi.spyOn(NoOpSecretMasker.prototype, 'flush').mockRejectedValue(
        new Error('stdout closed before mask registration'),
      );

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('files', () => {
    it('Should_NotReadOrWriteEnvFile_When_ExecModeIsUsed', async () => {
      // Act
      await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(getEnvironmentSpy).not.toHaveBeenCalled();
      expect(saveEnvironmentSpy).not.toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it('Should_NotReadOrWriteEnvFile_When_ExecModeFails', async () => {
      // Arrange
      secrets[API_KEY_PATH] = '';

      // Act
      const actual = await runCli(['exec', '--', 'node', 'app.js']);

      // Assert
      expect(actual).toBe(125);
      expect(getEnvironmentSpy).not.toHaveBeenCalled();
      expect(saveEnvironmentSpy).not.toHaveBeenCalled();
    });
  });
});
