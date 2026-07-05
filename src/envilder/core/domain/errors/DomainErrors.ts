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
