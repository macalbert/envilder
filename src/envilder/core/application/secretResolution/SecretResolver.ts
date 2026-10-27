import pc from 'picocolors';
import { EnvironmentVariable } from '../../domain/EnvironmentVariable.js';
import {
  ExpiredCredentialsError,
  type SecretFetchFailure,
  SsoSessionExpiredError,
} from '../../domain/errors/DomainErrors.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import type { ISecretMasker } from '../../domain/ports/ISecretMasker.js';
import type { ISecretProvider } from '../../domain/ports/ISecretProvider.js';
import { describeError } from '../../infrastructure/describeError.js';

export type ResolvedSecret = {
  status: 'resolved';
  envVar: string;
  value: string;
  masked: string;
};

export type UnresolvedSecret = {
  status: 'warning';
  envVar: string;
  path: string;
  reason: 'not-found' | 'empty';
};

export type FailedSecret = {
  status: 'error';
  envVar: string;
  /** Already masked. */
  path: string;
  reason: string;
};

export type SecretOutcome = ResolvedSecret | UnresolvedSecret | FailedSecret;

export type SecretResolution = {
  /** One outcome per mapping, in map-file order. */
  outcomes: SecretOutcome[];
  resolved: ResolvedSecret[];
  warnings: UnresolvedSecret[];
  errors: FailedSecret[];
};

const LABEL_WIDTH = 20;
const RULE = pc.yellow('\u2501'.repeat(60));

/**
 * Resolves the secrets declared in a map file and presents the outcome.
 *
 * Shared by every mode that reads secrets (pull and exec) so the outcomes,
 * masking, failure reasons and the per-secret block stay identical. Each mode
 * decides what to do with missing or empty secrets: pull skips them, exec
 * refuses to start the child.
 */
export class SecretResolver {
  constructor(
    private readonly secretProvider: ISecretProvider,
    private readonly logger: ILogger,
    private readonly secretMasker: ISecretMasker,
  ) {}

  /**
   * Fetches every mapped secret concurrently. Every resolved value is
   * registered with the secret masker as soon as it is known. Expired
   * credentials and SSO sessions propagate so callers can recover; any other
   * provider failure becomes an error outcome with a masked path.
   */
  async resolve(mappings: Record<string, string>): Promise<SecretResolution> {
    const outcomes = await Promise.all(
      Object.entries(mappings).map(([envVar, secretName]) =>
        this.resolveOne(envVar, secretName),
      ),
    );

    return {
      outcomes,
      resolved: outcomes.filter(
        (outcome): outcome is ResolvedSecret => outcome.status === 'resolved',
      ),
      warnings: outcomes.filter(
        (outcome): outcome is UnresolvedSecret => outcome.status === 'warning',
      ),
      errors: outcomes.filter(
        (outcome): outcome is FailedSecret => outcome.status === 'error',
      ),
    };
  }

  /**
   * Builds the failure entry used by `SecretsFetchError` for an outcome that
   * did not resolve. Missing and empty secrets use the reasons `not found`
   * and `empty`.
   */
  static toFailure(
    outcome: UnresolvedSecret | FailedSecret,
  ): SecretFetchFailure {
    if (outcome.status === 'error') {
      return {
        envVar: outcome.envVar,
        path: outcome.path,
        reason: outcome.reason,
      };
    }
    return {
      envVar: outcome.envVar,
      path: EnvironmentVariable.maskSecretPath(outcome.path),
      reason: outcome.reason === 'not-found' ? 'not found' : 'empty',
    };
  }

  /**
   * Logs the per-secret block: resolved secrets with masked values, then the
   * skipped ones as warnings.
   */
  logSecretsSection(
    resolved: ResolvedSecret[],
    warnings: UnresolvedSecret[],
  ): void {
    if (resolved.length === 0 && warnings.length === 0) {
      return;
    }

    this.logger.info(`\n${pc.bold(pc.yellow('\u{1FA99}  RESOLVING SECRETS'))}`);
    this.logger.info(RULE);
    for (const outcome of resolved) {
      this.logger.info(
        `  ${pc.green('\u2713 ')}${pc.bold(pad(outcome.envVar))}${pc.dim(
          '\u2192 ',
        )}${pc.dim(outcome.masked)}`,
      );
    }
    this.logSkippedWarnings(warnings);
  }

  private logSkippedWarnings(warnings: UnresolvedSecret[]): void {
    for (const outcome of warnings) {
      const maskedPath = EnvironmentVariable.maskSecretPath(outcome.path);
      if (outcome.reason === 'not-found') {
        this.logger.warn(
          `  ${pc.red('\u2717 ')}${pc.bold(
            pc.red(pad(outcome.envVar)),
          )} ${pc.red(`secret not found (path: ${maskedPath}) \u2014 skipped`)}`,
        );
        continue;
      }
      this.logger.warn(
        `  ${pc.yellow('\u26A0 ')}${pc.bold(pad(outcome.envVar))} ${pc.dim(
          `no value found (path: ${maskedPath}) \u2014 skipped`,
        )}`,
      );
    }
  }

  private async resolveOne(
    envVar: string,
    secretName: string,
  ): Promise<SecretOutcome> {
    try {
      const value = await this.secretProvider.getSecret(secretName);
      if (value === undefined) {
        return {
          status: 'warning',
          envVar,
          path: secretName,
          reason: 'not-found',
        };
      }
      if (value === '') {
        return { status: 'warning', envVar, path: secretName, reason: 'empty' };
      }

      this.secretMasker.mask(value);
      const masked = EnvironmentVariable.secret(envVar, value).maskedValue;

      return { status: 'resolved', envVar, value, masked };
    } catch (error) {
      if (
        error instanceof ExpiredCredentialsError ||
        error instanceof SsoSessionExpiredError
      ) {
        throw error;
      }
      const maskedPath = EnvironmentVariable.maskSecretPath(secretName);
      const reason = describeErrorReason(error, maskedPath);
      return { status: 'error', envVar, path: maskedPath, reason };
    }
  }
}

function describeErrorReason(error: unknown, maskedPath: string): string {
  const message = describeError(error);
  const duplicatedPrefix = `${maskedPath}: `;
  return message.startsWith(duplicatedPrefix)
    ? message.slice(duplicatedPrefix.length)
    : message;
}

function pad(name: string): string {
  return name.padEnd(LABEL_WIDTH);
}
