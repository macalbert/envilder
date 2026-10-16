import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ExecWithSecretsCommand } from '../../../../../src/envilder/core/application/execWithSecrets/ExecWithSecretsCommand';
import { ExecWithSecretsCommandHandler } from '../../../../../src/envilder/core/application/execWithSecrets/ExecWithSecretsCommandHandler';
import { EnvironmentVariable } from '../../../../../src/envilder/core/domain/EnvironmentVariable';
import {
  ExpiredCredentialsError,
  InvalidArgumentError,
  SecretsFetchError,
  SsoSessionExpiredError,
} from '../../../../../src/envilder/core/domain/errors/DomainErrors';
import type { ILogger } from '../../../../../src/envilder/core/domain/ports/ILogger';
import type { IProcessContext } from '../../../../../src/envilder/core/domain/ports/IProcessContext';
import type {
  IProcessRunner,
  ProcessRequest,
} from '../../../../../src/envilder/core/domain/ports/IProcessRunner';
import type { ISecretMasker } from '../../../../../src/envilder/core/domain/ports/ISecretMasker';
import type { ISecretProvider } from '../../../../../src/envilder/core/domain/ports/ISecretProvider';
import type { IVariableStore } from '../../../../../src/envilder/core/domain/ports/IVariableStore';

const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

const DB_URL_PATH = '/app/dev/db-url';
const API_KEY_PATH = '/app/dev/api-key';
const DB_URL_VALUE = 'fake-db-url-value-7Qx2Lm9Rv4Tz8Kp1';
const API_KEY_VALUE = 'fake-api-key-value-3Hn6Wc1Ys5Jd0Bg7';
const MAP_PATH = 'envilder.json';
const INHERITED_NAME = 'ENVILDER_EXEC_TEST_INHERITED';
const SIGNAL_NUMBERS: Partial<Record<NodeJS.Signals, number>> = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGKILL: 9,
  SIGTERM: 15,
};

function strip(value: unknown): string {
  return String(value).replace(ANSI_PATTERN, '');
}

describe('ExecWithSecretsCommandHandler', () => {
  let secrets: Record<string, string | undefined>;
  let mockSecretProvider: ISecretProvider & { getSecret: Mock };
  let mockVariableStore: IVariableStore & {
    getMapping: Mock;
    getParsedMapping: Mock;
    getEnvironment: Mock;
    saveEnvironment: Mock;
  };
  let mockLogger: ILogger & { info: Mock; warn: Mock; error: Mock };
  let mockSecretMasker: ISecretMasker & { mask: Mock; flush: Mock };
  let mockProcessRunner: IProcessRunner & { run: Mock };
  let inherited: Record<string, string | undefined>;
  let platform: NodeJS.Platform;
  let fakeProcessContext: IProcessContext;
  let sut: ExecWithSecretsCommandHandler;

  function loggedText(): string {
    return [
      ...mockLogger.info.mock.calls,
      ...mockLogger.warn.mock.calls,
      ...mockLogger.error.mock.calls,
    ]
      .map((call) => strip(call[0]))
      .join('\n');
  }

  function runRequest(): ProcessRequest {
    return mockProcessRunner.run.mock.calls[0][0] as ProcessRequest;
  }

  beforeEach(() => {
    secrets = {
      [DB_URL_PATH]: DB_URL_VALUE,
      [API_KEY_PATH]: API_KEY_VALUE,
    };
    mockSecretProvider = {
      getSecret: vi.fn(async (name: string) => secrets[name]),
      setSecret: vi.fn(),
    };
    mockVariableStore = {
      getMapping: vi.fn().mockResolvedValue({
        DB_URL: DB_URL_PATH,
        API_KEY: API_KEY_PATH,
      }),
      getParsedMapping: vi.fn(),
      getEnvironment: vi.fn(),
      saveEnvironment: vi.fn(),
    };
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    mockSecretMasker = {
      mask: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };
    mockProcessRunner = {
      run: vi.fn().mockResolvedValue({ code: 0, signal: null }),
    };
    inherited = { [INHERITED_NAME]: 'inherited-value' };
    platform = 'linux';
    fakeProcessContext = {
      environment: () => inherited,
      platform: () => platform,
      signalNumber: (signal: NodeJS.Signals) => SIGNAL_NUMBERS[signal] ?? 0,
    };

    sut = new ExecWithSecretsCommandHandler(
      mockSecretProvider,
      mockVariableStore,
      mockLogger,
      mockSecretMasker,
      mockProcessRunner,
      fakeProcessContext,
    );
  });

  it('Should_StartChildWithResolvedSecrets_When_AllSecretsResolve', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', ['app.js']);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockVariableStore.getMapping).toHaveBeenCalledWith(MAP_PATH);
    expect(mockProcessRunner.run).toHaveBeenCalledTimes(1);
    expect(runRequest().env).toMatchObject({
      DB_URL: DB_URL_VALUE,
      API_KEY: API_KEY_VALUE,
    });
  });

  it('Should_PassArgumentsVerbatim_When_CommandHasArguments', async () => {
    // Arrange
    const args = ['app.js', '--port', '3000', '--map', 'foo', '$DB_URL', 'a b'];
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', args);

    // Act
    await sut.handle(command);

    // Assert
    expect(runRequest().command).toBe('node');
    expect(runRequest().args).toEqual([
      'app.js',
      '--port',
      '3000',
      '--map',
      'foo',
      '$DB_URL',
      'a b',
    ]);
  });

  it('Should_NotReadOrWriteEnvFile_When_ExecModeIsUsed', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockVariableStore.getEnvironment).not.toHaveBeenCalled();
    expect(mockVariableStore.saveEnvironment).not.toHaveBeenCalled();
    expect(mockProcessRunner.run).toHaveBeenCalledTimes(1);
  });

  it('Should_NotReadOrWriteEnvFile_When_ExecModeFails', async () => {
    // Arrange
    secrets[API_KEY_PATH] = undefined;
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(SecretsFetchError);
    expect(mockVariableStore.getEnvironment).not.toHaveBeenCalled();
    expect(mockVariableStore.saveEnvironment).not.toHaveBeenCalled();
  });

  it('Should_InheritParentEnvironment_When_ChildStarts', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(runRequest().env[INHERITED_NAME]).toBe('inherited-value');
  });

  it('Should_OverrideInheritedVariable_When_MapDeclaresSameName', async () => {
    // Arrange
    inherited.API_KEY = 'from-shell';
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(runRequest().env.API_KEY).toBe(API_KEY_VALUE);
  });

  it('Should_LogOverriddenNamesWithoutValues_When_InheritedVariableIsOverridden', async () => {
    // Arrange
    inherited.API_KEY = 'from-shell-value';
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    const warnings = mockLogger.warn.mock.calls.map((call) => strip(call[0]));
    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Overriding inherited variables: API_KEY'),
      ]),
    );
    expect(loggedText()).not.toContain('from-shell-value');
    expect(loggedText()).not.toContain(API_KEY_VALUE);
  });

  it('Should_NotLogOverrideNotice_When_NoInheritedVariableIsOverridden', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(loggedText()).not.toContain('Overriding inherited variables');
    expect(mockProcessRunner.run).toHaveBeenCalledTimes(1);
  });

  it('Should_PassValueByteForByte_When_ValueIsMultiline', async () => {
    // Arrange
    const pem =
      '-----BEGIN FAKE TEST BLOCK-----\nMIIEvQIBADANBg\r\nkqhkiG9w0BAQEF\n-----END FAKE TEST BLOCK-----\n';
    const special = `a=b "q" 'q' #hash $DB_URL ñ 日本`;
    secrets[DB_URL_PATH] = pem;
    secrets[API_KEY_PATH] = special;
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(runRequest().env.DB_URL).toBe(pem);
    expect(runRequest().env.API_KEY).toBe(special);
  });

  it('Should_NotStartChild_When_ValueContainsNulByte', async () => {
    // Arrange
    secrets[DB_URL_PATH] = 'before\0after';
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect((actual as Error).message).toBe(
      'Secret for DB_URL contains a NUL byte and cannot be passed as an environment variable.',
    );
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_NotStartChild_When_SecretIsMissing', async () => {
    // Arrange
    secrets[API_KEY_PATH] = undefined;
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(SecretsFetchError);
    expect((actual as SecretsFetchError).failures).toEqual([
      {
        envVar: 'API_KEY',
        path: EnvironmentVariable.maskSecretPath(API_KEY_PATH),
        reason: 'not found',
      },
    ]);
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_NotStartChild_When_SecretIsEmpty', async () => {
    // Arrange
    secrets[API_KEY_PATH] = '';
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(SecretsFetchError);
    expect((actual as SecretsFetchError).failures).toEqual([
      {
        envVar: 'API_KEY',
        path: EnvironmentVariable.maskSecretPath(API_KEY_PATH),
        reason: 'empty',
      },
    ]);
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_NotStartChild_When_SecretFetchFails', async () => {
    // Arrange
    mockSecretProvider.getSecret.mockImplementation(async (name: string) => {
      if (name === API_KEY_PATH) {
        throw new Error('AccessDeniedException: not authorized to read');
      }
      return secrets[name];
    });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(SecretsFetchError);
    expect((actual as SecretsFetchError).failures).toEqual([
      expect.objectContaining({
        envVar: 'API_KEY',
        path: EnvironmentVariable.maskSecretPath(API_KEY_PATH),
        reason: expect.stringContaining('AccessDeniedException'),
      }),
    ]);
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_PropagateSsoSessionExpiredError_When_ProviderSessionExpired', async () => {
    // Arrange
    const ssoError = new SsoSessionExpiredError('dev');
    mockSecretProvider.getSecret.mockRejectedValue(ssoError);
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBe(ssoError);
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_PropagateExpiredCredentialsError_When_ProviderCredentialsExpired', async () => {
    // Arrange
    const credentialsError = new ExpiredCredentialsError();
    mockSecretProvider.getSecret.mockRejectedValue(credentialsError);
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBe(credentialsError);
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_StartChildWithWarning_When_MapDeclaresNoVariables', async () => {
    // Arrange
    mockVariableStore.getMapping.mockResolvedValue({});
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(actual).toBe(0);
    expect(mockLogger.warn.mock.calls.map((call) => strip(call[0]))).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Map file declares no variables.'),
      ]),
    );
    expect(mockProcessRunner.run).toHaveBeenCalledTimes(1);
    expect(runRequest().env[INHERITED_NAME]).toBe('inherited-value');
  });

  it('Should_PrintSingleSummaryLine_When_AllSecretsResolve', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'npm', [
      'run',
      'dev',
    ]);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    const summary = strip(mockLogger.info.mock.calls[0][0]);
    expect(summary).not.toContain('\n');
    expect(summary).toMatch(/\b2\b/);
    expect(summary).toContain('resolved');
  });

  it('Should_RegisterEveryResolvedValueWithMaskerBeforeStartingChild_When_AllSecretsResolve', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    const maskedValues = mockSecretMasker.mask.mock.calls.map(
      (call) => call[0],
    );
    expect(maskedValues).toEqual(
      expect.arrayContaining([DB_URL_VALUE, API_KEY_VALUE]),
    );
    const lastMaskOrder = Math.max(
      ...mockSecretMasker.mask.mock.invocationCallOrder,
    );
    expect(lastMaskOrder).toBeLessThan(
      mockProcessRunner.run.mock.invocationCallOrder[0],
    );
  });

  it('Should_NotLogCompleteSecretValues_When_ExecSucceeds', async () => {
    // Arrange
    inherited.API_KEY = 'shell-value';
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockLogger.info).toHaveBeenCalled();
    expect(loggedText()).not.toContain(DB_URL_VALUE);
    expect(loggedText()).not.toContain(API_KEY_VALUE);
  });

  it('Should_NotLogCompleteSecretValues_When_ExecFails', async () => {
    // Arrange
    secrets[API_KEY_PATH] = undefined;
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    const surfaced = `${loggedText()}\n${(actual as Error).message}\n${JSON.stringify(
      (actual as SecretsFetchError).failures,
    )}`;
    expect(actual).toBeInstanceOf(SecretsFetchError);
    expect(surfaced).not.toContain(DB_URL_VALUE);
  });

  it('Should_PropagateChildExitCode_When_ChildExits', async () => {
    // Arrange
    mockProcessRunner.run.mockResolvedValue({ code: 3, signal: null });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(actual).toBe(3);
  });

  it('Should_ExitWith128PlusSignal_When_ChildIsKilledBySignal', async () => {
    // Arrange
    mockProcessRunner.run.mockResolvedValue({ code: null, signal: 'SIGKILL' });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(actual).toBe(137);
  });

  it('Should_MergeNamesCaseInsensitively_When_RunningOnWindows', async () => {
    // Arrange
    platform = 'win32';
    inherited = { Path: 'C:inherited' };
    mockVariableStore.getMapping.mockResolvedValue({ PATH: DB_URL_PATH });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'cmd', []);

    // Act
    await sut.handle(command);

    // Assert
    const pathEntries = Object.entries(runRequest().env).filter(
      ([name]) => name.toUpperCase() === 'PATH',
    );
    expect(pathEntries).toEqual([['PATH', DB_URL_VALUE]]);
  });

  it('Should_KeepNamesThatDifferOnlyByCase_When_RunningOnPosix', async () => {
    // Arrange
    inherited = { Path: '/inherited' };
    mockVariableStore.getMapping.mockResolvedValue({ PATH: DB_URL_PATH });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'sh', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(runRequest().env.Path).toBe('/inherited');
    expect(runRequest().env.PATH).toBe(DB_URL_VALUE);
  });

  it('Should_UseProcessContextSignalNumbers_When_ChildIsKilledBySignal', async () => {
    // Arrange
    fakeProcessContext.signalNumber = () => 20;
    mockProcessRunner.run.mockResolvedValue({ code: null, signal: 'SIGTERM' });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command);

    // Assert
    expect(actual).toBe(148);
  });

  it('Should_NotStartChild_When_MapNamesDifferOnlyByCaseOnWindows', async () => {
    // Arrange
    platform = 'win32';
    mockVariableStore.getMapping.mockResolvedValue({
      Path: DB_URL_PATH,
      PATH: API_KEY_PATH,
    });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'cmd', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBeInstanceOf(InvalidArgumentError);
    expect((actual as Error).message).toContain('Path');
    expect((actual as Error).message).toContain('PATH');
    expect((actual as Error).message).toContain('differ only by case');
    expect(mockSecretProvider.getSecret).not.toHaveBeenCalled();
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_KeepBothMappedNames_When_MapNamesDifferOnlyByCaseOnPosix', async () => {
    // Arrange
    mockVariableStore.getMapping.mockResolvedValue({
      Path: DB_URL_PATH,
      PATH: API_KEY_PATH,
    });
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'sh', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(runRequest().env.Path).toBe(DB_URL_VALUE);
    expect(runRequest().env.PATH).toBe(API_KEY_VALUE);
  });

  it('Should_FlushMaskerAfterMaskingAndBeforeStartingChild_When_AllSecretsResolve', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    expect(mockSecretMasker.flush).toHaveBeenCalled();
    const lastMaskOrder = Math.max(
      ...mockSecretMasker.mask.mock.invocationCallOrder,
    );
    const lastFlushOrder = Math.max(
      ...mockSecretMasker.flush.mock.invocationCallOrder,
    );
    expect(lastMaskOrder).toBeLessThan(lastFlushOrder);
    expect(lastFlushOrder).toBeLessThan(
      mockProcessRunner.run.mock.invocationCallOrder[0],
    );
  });

  it('Should_NotStartChild_When_MaskerFlushIsStillPending', async () => {
    // Arrange
    mockSecretMasker.flush.mockReturnValue(new Promise<void>(() => undefined));
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    void sut.handle(command);
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Assert
    expect(mockSecretMasker.flush).toHaveBeenCalled();
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_StartChildOnce_When_PendingMaskerFlushResolves', async () => {
    // Arrange
    let releaseFlush: () => void = () => undefined;
    mockSecretMasker.flush.mockReturnValue(
      new Promise<void>((resolve) => {
        releaseFlush = resolve;
      }),
    );
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);
    const running = sut.handle(command);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const runCallsWhilePending = mockProcessRunner.run.mock.calls.length;

    // Act
    releaseFlush();
    const actual = await running;

    // Assert
    expect(runCallsWhilePending).toBe(0);
    expect(mockProcessRunner.run).toHaveBeenCalledTimes(1);
    expect(actual).toBe(0);
  });

  it('Should_NotStartChild_When_MaskerFlushFails', async () => {
    // Arrange
    const flushError = new Error('stdout closed before mask registration');
    mockSecretMasker.flush.mockRejectedValue(flushError);
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    const actual = await sut.handle(command).catch((error: unknown) => error);

    // Assert
    expect(actual).toBe(flushError);
    expect(mockProcessRunner.run).not.toHaveBeenCalled();
  });

  it('Should_ShowOnlyProgramNameInSummary_When_CommandHasArguments', async () => {
    // Arrange
    const bearer = 'tok-SECRET-5Pq1Zr';
    const args = [
      '-H',
      `Authorization: Bearer ${bearer}`,
      'https://api.example.test',
    ];
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'curl', args);

    // Act
    await sut.handle(command);

    // Assert
    const summary = strip(mockLogger.info.mock.calls[0][0]);
    expect(summary).toContain('\u2192 curl \u2026');
    expect(loggedText()).not.toContain(bearer);
    expect(loggedText()).not.toContain('Authorization');
    expect(loggedText()).not.toContain('https://api.example.test');
    expect(runRequest().args).toEqual(args);
  });

  it('Should_ShowProgramNameWithoutEllipsis_When_CommandHasNoArguments', async () => {
    // Arrange
    const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

    // Act
    await sut.handle(command);

    // Assert
    const summary = strip(mockLogger.info.mock.calls[0][0]);
    expect(summary.endsWith('\u2192 node')).toBe(true);
  });

  it.each([
    ['SsoSessionExpired', () => new SsoSessionExpiredError('dev')],
    ['ExpiredCredentials', () => new ExpiredCredentialsError()],
  ])(
    'Should_RejectWithNonRetriableError_When_RunnerThrows%sAfterResolution',
    async (_name, buildError) => {
      // Arrange
      mockProcessRunner.run.mockRejectedValue(buildError());
      const command = ExecWithSecretsCommand.create(MAP_PATH, 'node', []);

      // Act
      const actual = await sut.handle(command).catch((error: unknown) => error);

      // Assert
      expect(actual).toBeInstanceOf(Error);
      expect(actual).not.toBeInstanceOf(SsoSessionExpiredError);
      expect(actual).not.toBeInstanceOf(ExpiredCredentialsError);
      expect(mockProcessRunner.run).toHaveBeenCalledTimes(1);
    },
  );
});
