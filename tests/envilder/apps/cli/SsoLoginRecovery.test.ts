import { describe, expect, it, vi } from 'vitest';
import { SilentExitError } from '../../../../src/envilder/apps/cli/SilentExitError';
import {
  buildLoginArgs,
  executeWithSsoRecovery,
  type RecoveryDeps,
} from '../../../../src/envilder/apps/cli/SsoLoginRecovery';
import { SsoSessionExpiredError } from '../../../../src/envilder/core/domain/errors/DomainErrors';

describe('SsoLoginRecovery', () => {
  it('Should_RethrowSsoError_When_NotInteractive', async () => {
    // Arrange
    const ssoError = new SsoSessionExpiredError('dev');
    const run = vi.fn().mockRejectedValue(ssoError);
    const confirm = vi.fn();
    const runLogin = vi.fn();
    const deps: Partial<RecoveryDeps> = {
      isInteractive: () => false,
      confirm,
      runLogin,
      write: vi.fn(),
    };

    // Act
    const act = executeWithSsoRecovery(run, deps);

    // Assert
    await expect(act).rejects.toBe(ssoError);
    expect(confirm).not.toHaveBeenCalled();
    expect(runLogin).not.toHaveBeenCalled();
  });

  it('Should_RethrowError_When_ErrorIsNotSsoSessionExpired', async () => {
    // Arrange
    const genericError = new Error('boom');
    const run = vi.fn().mockRejectedValue(genericError);
    const isInteractive = vi.fn(() => true);
    const confirm = vi.fn();
    const deps: Partial<RecoveryDeps> = {
      isInteractive,
      confirm,
      runLogin: vi.fn(),
      write: vi.fn(),
    };

    // Act
    const act = executeWithSsoRecovery(run, deps);

    // Assert
    await expect(act).rejects.toBe(genericError);
    expect(isInteractive).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('Should_ThrowSilentExit_When_InteractiveAndUserDeclines', async () => {
    // Arrange
    const ssoError = new SsoSessionExpiredError('dev');
    const run = vi.fn().mockRejectedValue(ssoError);
    const confirm = vi.fn().mockResolvedValue(false);
    const runLogin = vi.fn();
    const write = vi.fn();
    const deps: Partial<RecoveryDeps> = {
      isInteractive: () => true,
      confirm,
      runLogin,
      write,
    };

    // Act
    const act = executeWithSsoRecovery(run, deps);

    // Assert
    await expect(act).rejects.toBeInstanceOf(SilentExitError);
    expect(confirm).toHaveBeenCalledWith(
      expect.stringContaining('aws sso login --profile dev'),
    );
    expect(runLogin).not.toHaveBeenCalled();
    expect(write).toHaveBeenCalledWith(
      'Skipped. Run the command above when ready, then re-run envilder.',
    );
  });

  it('Should_ResolveAfterRetry_When_LoginSucceedsAndRetrySucceeds', async () => {
    // Arrange
    const ssoError = new SsoSessionExpiredError('dev');
    const run = vi
      .fn()
      .mockRejectedValueOnce(ssoError)
      .mockResolvedValueOnce(undefined);
    const confirm = vi.fn().mockResolvedValue(true);
    const runLogin = vi.fn().mockResolvedValue(0);
    const write = vi.fn();
    const deps: Partial<RecoveryDeps> = {
      isInteractive: () => true,
      confirm,
      runLogin,
      write,
    };

    // Act
    await executeWithSsoRecovery(run, deps);

    // Assert
    expect(runLogin).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(2);
    expect(write).toHaveBeenCalledWith('\u2b50 Level cleared.');
  });

  it('Should_ThrowSilentExitWithoutReoffering_When_RetryRaisesSsoErrorAgain', async () => {
    // Arrange
    const run = vi
      .fn()
      .mockRejectedValueOnce(new SsoSessionExpiredError('dev'))
      .mockRejectedValueOnce(new SsoSessionExpiredError('dev'));
    const confirm = vi.fn().mockResolvedValue(true);
    const runLogin = vi.fn().mockResolvedValue(0);
    const deps: Partial<RecoveryDeps> = {
      isInteractive: () => true,
      confirm,
      runLogin,
      write: vi.fn(),
    };

    // Act
    const act = executeWithSsoRecovery(run, deps);

    // Assert
    await expect(act).rejects.toBeInstanceOf(SilentExitError);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(runLogin).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('Should_ThrowSilentExit_When_LoginExitsNonZero', async () => {
    // Arrange
    const ssoError = new SsoSessionExpiredError('dev');
    const run = vi.fn().mockRejectedValue(ssoError);
    const confirm = vi.fn().mockResolvedValue(true);
    const runLogin = vi.fn().mockResolvedValue(1);
    const deps: Partial<RecoveryDeps> = {
      isInteractive: () => true,
      confirm,
      runLogin,
      write: vi.fn(),
    };

    // Act
    const act = executeWithSsoRecovery(run, deps);

    // Assert
    await expect(act).rejects.toBeInstanceOf(SilentExitError);
    expect(runLogin).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('Should_ThrowSilentExit_When_LoginBinaryNotFound', async () => {
    // Arrange
    const ssoError = new SsoSessionExpiredError('dev');
    const run = vi.fn().mockRejectedValue(ssoError);
    const confirm = vi.fn().mockResolvedValue(true);
    const runLogin = vi.fn().mockResolvedValue(-1);
    const deps: Partial<RecoveryDeps> = {
      isInteractive: () => true,
      confirm,
      runLogin,
      write: vi.fn(),
    };

    // Act
    const act = executeWithSsoRecovery(run, deps);

    // Assert
    await expect(act).rejects.toBeInstanceOf(SilentExitError);
    expect(runLogin).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('Should_IncludeProfileFlag_When_ProfileNameProvided', () => {
    // Arrange
    const profileName = 'dev';

    // Act
    const actual = buildLoginArgs(profileName);

    // Assert
    expect(actual).toEqual(['sso', 'login', '--profile', 'dev']);
  });

  it('Should_OmitProfileFlag_When_NoProfileName', () => {
    // Arrange
    const profileName = undefined;

    // Act
    const actual = buildLoginArgs(profileName);

    // Assert
    expect(actual).toEqual(['sso', 'login']);
  });

  it('Should_KeepProfileAsSingleArg_When_ProfileContainsShellMetacharacters', () => {
    // Arrange
    const maliciousProfile = 'dev; rm -rf /';

    // Act
    const actual = buildLoginArgs(maliciousProfile);

    // Assert
    expect(actual).toEqual(['sso', 'login', '--profile', 'dev; rm -rf /']);
  });
});
