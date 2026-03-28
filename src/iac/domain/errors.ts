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

export class ConfigValidationError extends DeploymentError {
  constructor(
    message: string,
    public readonly validationErrors: string[],
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}
