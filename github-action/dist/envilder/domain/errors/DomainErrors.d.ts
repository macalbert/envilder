/**
 * Base class for all domain-specific errors in the application.
 */
export declare class DomainError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when required arguments are missing or invalid.
 */
export declare class InvalidArgumentError extends DomainError {
}
/**
 * Error thrown when a required dependency is missing.
 */
export declare class DependencyMissingError extends DomainError {
}
/**
 * Error thrown when a secret operation fails.
 */
export declare class SecretOperationError extends DomainError {
}
/**
 * Error thrown when an environment file operation fails.
 */
export declare class EnvironmentFileError extends DomainError {
}
/**
 * Error thrown when a parameter cannot be found.
 */
export declare class ParameterNotFoundError extends DomainError {
    constructor(paramName: string);
    readonly paramName: string;
}
//# sourceMappingURL=DomainErrors.d.ts.map