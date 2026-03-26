/**
 * Represents an environment variable with validation and business rules.
 */
export class EnvironmentVariable {
  private readonly _name: string;
  private readonly _value: string;
  private readonly _isSecret: boolean;

  /**
   * Creates a new environment variable
   *
   * @param name - The name of the environment variable
   * @param value - The value of the environment variable
   * @param isSecret - Whether this variable should be treated as sensitive information
   */
  constructor(name: string, value: string, isSecret: boolean = false) {
    this.validate(name, value);
    this._name = name;
    this._value = value;
    this._isSecret = isSecret;
  }

  /**
   * Gets the name of the environment variable
   */
  get name(): string {
    return this._name;
  }

  /**
   * Gets the value of the environment variable
   */
  get value(): string {
    return this._value;
  }

  /**
   * Gets whether this variable is sensitive information
   */
  get isSecret(): boolean {
    return this._isSecret;
  }

  /**
   * Returns a masked representation of the value for logging
   */
  get maskedValue(): string {
    if (!this._isSecret) {
      return this._value;
    }

    return EnvironmentVariable.mask(this._value, 10);
  }

  /**
   * Returns a masked representation of a secret path for safe logging.
   */
  static maskSecretPath(path: string): string {
    return EnvironmentVariable.mask(path, 3);
  }

  private static mask(value: string, minLengthToShowTail: number): string {
    return value.length > minLengthToShowTail
      ? '*'.repeat(value.length - 3) + value.slice(-3)
      : '*'.repeat(value.length);
  }

  /**
   * Validates the environment variable
   */
  private validate(name: string, value: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Environment variable name cannot be empty');
    }

    if (value === undefined || value === null) {
      throw new Error(
        `Value for environment variable ${name} cannot be null or undefined`,
      );
    }
  }
}
