/**
 * Represents an environment variable with validation and business rules.
 */
export declare class EnvironmentVariable {
    private readonly _name;
    private readonly _value;
    private readonly _isSecret;
    /**
     * Creates a new environment variable
     *
     * @param name - The name of the environment variable
     * @param value - The value of the environment variable
     * @param isSecret - Whether this variable should be treated as sensitive information
     */
    constructor(name: string, value: string, isSecret?: boolean);
    /**
     * Gets the name of the environment variable
     */
    get name(): string;
    /**
     * Gets the value of the environment variable
     */
    get value(): string;
    /**
     * Gets whether this variable is sensitive information
     */
    get isSecret(): boolean;
    /**
     * Returns a masked representation of the value for logging
     */
    get maskedValue(): string;
    /**
     * Validates the environment variable
     */
    private validate;
}
//# sourceMappingURL=EnvironmentVariable.d.ts.map