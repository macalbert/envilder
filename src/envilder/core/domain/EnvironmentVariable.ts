import {
  invalidEnvironmentVariableNameMessage,
  isValidEnvironmentVariableName,
} from './EnvironmentVariableName.js';
import { InvalidArgumentError } from './errors/DomainErrors.js';

/**
 * Represents an environment variable with validation and business rules.
 */
export class EnvironmentVariable {
  private readonly _name: string;
  private readonly _value: string;

  /**
   * Creates a new environment variable
   *
   * @param name - The name of the environment variable
   * @param value - The value of the environment variable
   */
  constructor(name: string, value: string) {
    this.validate(name, value);
    this._name = name;
    this._value = value;
  }

  static secret(name: string, value: string): EnvironmentVariable {
    return new SecretEnvironmentVariable(name, value);
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
    return false;
  }

  /**
   * Returns a masked representation of the value for logging
   */
  get maskedValue(): string {
    return this._value;
  }

  /**
   * Returns a masked representation of a secret path for safe logging.
   */
  static maskSecretPath(path: string): string {
    return EnvironmentVariable.mask(path, 3);
  }

  protected static mask(value: string, minLengthToShowTail: number): string {
    return value.length > minLengthToShowTail
      ? '*'.repeat(value.length - 3) + value.slice(-3)
      : '*'.repeat(value.length);
  }

  /**
   * Validates the environment variable
   */
  private validate(name: string, value: string): void {
    if (!isValidEnvironmentVariableName(name)) {
      throw new InvalidArgumentError(
        invalidEnvironmentVariableNameMessage(name),
      );
    }

    if (value === undefined || value === null) {
      throw new Error(
        `Value for environment variable ${name} cannot be null or undefined`,
      );
    }
  }
}

class SecretEnvironmentVariable extends EnvironmentVariable {
  override get isSecret(): boolean {
    return true;
  }

  override get maskedValue(): string {
    return EnvironmentVariable.mask(this.value, 10);
  }
}
