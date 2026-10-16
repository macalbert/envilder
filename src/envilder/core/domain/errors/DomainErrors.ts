/**
 * Base class for all domain-specific errors in the application.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when required arguments are missing or invalid.
 */
export class InvalidArgumentError extends DomainError {}

/**
 * Error thrown when a required dependency is missing.
 */
export class DependencyMissingError extends DomainError {}

/**
 * Error thrown when a secret operation fails.
 */
export class SecretOperationError extends DomainError {}

/**
 * Error thrown when an environment file operation fails.
 */
export class EnvironmentFileError extends DomainError {}

/**
 * Error thrown when a parameter cannot be found.
 */
export class ParameterNotFoundError extends DomainError {
  constructor(paramName: string) {
    super(`Parameter not found: ${paramName}`);
    this.paramName = paramName;
  }

  readonly paramName: string;
}

/**
 * Error thrown when AWS credentials or the security token are expired or invalid.
 */
export class ExpiredCredentialsError extends DomainError {
  readonly cause?: unknown;

  constructor(cause?: unknown) {
    super(
      'AWS credentials are expired or invalid. Your security token or SSO ' +
        'session may have expired. Refresh your credentials and retry ' +
        '(for SSO, run: aws sso login).',
    );
    this.cause = cause;
  }
}

/**
 * Error thrown when the AWS SSO session could not be resolved or loaded.
 */
export class SsoSessionExpiredError extends DomainError {
  readonly profileName?: string;
  readonly cause?: unknown;

  constructor(profileName?: string, cause?: unknown) {
    super(SsoSessionExpiredError.buildMessage(profileName));
    this.profileName = profileName;
    this.cause = cause;
  }

  private static buildMessage(profileName?: string): string {
    if (profileName) {
      return (
        `Your AWS SSO session for profile '${profileName}' could not be ` +
        `loaded or has expired. Run: aws sso login --profile ${profileName} ` +
        'and then re-run this command.'
      );
    }
    return (
      'Your AWS SSO session could not be loaded or has expired. Run: ' +
      'aws sso login and then re-run this command.'
    );
  }
}

/**
 * Describes a single secret that could not be resolved during a pull operation.
 */
export type SecretFetchFailure = {
  envVar: string;
  path: string;
  reason: string;
};

/**
 * Error thrown when one or more secrets could not be fetched during a pull.
 */
export class SecretsFetchError extends DomainError {
  constructor(readonly failures: ReadonlyArray<SecretFetchFailure>) {
    super('Some secrets could not be fetched');
  }
}

/**
 * Error thrown when the command passed to exec mode cannot be found.
 */
export class CommandNotFoundError extends DomainError {
  constructor(readonly command: string) {
    super(`Command not found: ${command}`);
  }
}

/**
 * Error thrown when the command passed to exec mode exists but cannot be
 * executed (for example, a script without the executable bit).
 */
export class CommandNotExecutableError extends DomainError {
  /**
   * @param reason - Why the command cannot be executed. Without it the
   * message is `Permission denied: <command>`.
   */
  constructor(
    readonly command: string,
    reason?: string,
  ) {
    super(
      reason === undefined
        ? `Permission denied: ${command}`
        : `Cannot execute ${command}: ${reason}`,
    );
  }
}

/**
 * Error thrown when Envilder could not start the command for a reason that is
 * not about the command itself, for example exhausted system resources. The
 * message names the command, never its arguments.
 */
export class CommandStartError extends DomainError {
  constructor(
    readonly command: string,
    reason: string,
  ) {
    super(`Cannot start ${command}: ${reason}`);
  }
}

/**
 * Error thrown when the child environment exceeds the operating system limit.
 */
export class EnvironmentTooLargeError extends DomainError {
  constructor() {
    super('Environment too large to start the command (E2BIG).');
  }
}

/**
 * Error thrown when exec mode fails after it started supervising the child
 * (from the mask flush onward). It is deliberately not an SSO or
 * credentials error, so recovery never retries the run and the child is
 * never started twice. The message only carries the cause's message.
 */
export class ExecInterruptedError extends DomainError {
  readonly cause: unknown;

  constructor(cause: unknown) {
    const reason =
      cause instanceof Error && cause.message ? cause.message : String(cause);
    super(`The command could not be supervised after it started: ${reason}`);
    this.cause = cause;
  }
}
