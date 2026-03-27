/**
 * Base error class for all IAC deployment errors
 */
export class DeploymentError extends Error {
  public cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'DeploymentError';
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends DeploymentError {
  constructor(
    message: string,
    public readonly filePath: string,
    cause?: Error,
  ) {
    super(message, cause);
    this.name = 'FileOperationError';
  }
}

/**
 * Error thrown when ECR authentication fails
 */
export class EcrAuthError extends DeploymentError {
  constructor(
    message: string,
    public readonly region?: string,
    public readonly account?: string,
    cause?: Error,
  ) {
    super(message, cause);
    this.name = 'EcrAuthError';
  }
}

/**
 * Error thrown when stack building fails
 */
export class StackBuildError extends DeploymentError {
  constructor(
    message: string,
    public readonly stackName?: string,
    cause?: Error,
  ) {
    super(message, cause);
    this.name = 'StackBuildError';
  }
}

/**
 * Error thrown when configuration validation fails
 */
export class ConfigValidationError extends DeploymentError {
  constructor(
    message: string,
    public readonly validationErrors: string[],
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}
