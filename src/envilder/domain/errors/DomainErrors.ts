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
