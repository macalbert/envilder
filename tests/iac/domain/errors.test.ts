import {
  ConfigValidationError,
  DeploymentError,
  FileOperationError,
  StackBuildError,
} from '../../../src/iac/domain/errors';

describe('DeploymentError', () => {
  test('Should_CreateDeploymentError_When_MessageProvided', () => {
    // Arrange
    const message = 'Deployment failed';

    // Act
    const error = new DeploymentError(message);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DeploymentError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('DeploymentError');
  });

  test('Should_HaveStackTrace_When_ErrorCreated', () => {
    // Arrange
    const message = 'Deployment failed';

    // Act
    const error = new DeploymentError(message);

    // Assert
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('DeploymentError');
  });

  test('Should_CreateDeploymentError_When_CauseProvided', () => {
    // Arrange
    const message = 'Deployment failed';
    const cause = new Error('Original error');

    // Act
    const error = new DeploymentError(message, cause);

    // Assert
    expect(error.message).toBe(message);
    expect(error.name).toBe('DeploymentError');
    expect(error.cause).toBe(cause);
  });
});

describe('FileOperationError', () => {
  test('Should_CreateFileOperationError_When_MessageAndFilePathProvided', () => {
    // Arrange
    const message = 'Failed to read file';
    const filePath = '/path/to/file.txt';

    // Act
    const error = new FileOperationError(message, filePath);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DeploymentError);
    expect(error).toBeInstanceOf(FileOperationError);
    expect(error.message).toBe(message);
    expect(error.filePath).toBe(filePath);
    expect(error.name).toBe('FileOperationError');
    expect(error.cause).toBeUndefined();
  });

  test('Should_CreateFileOperationError_When_CauseProvided', () => {
    // Arrange
    const message = 'Failed to read file';
    const filePath = '/path/to/file.txt';
    const cause = new Error('ENOENT: no such file or directory');

    // Act
    const error = new FileOperationError(message, filePath, cause);

    // Assert
    expect(error.message).toBe(message);
    expect(error.filePath).toBe(filePath);
    expect(error.name).toBe('FileOperationError');
    expect(error.cause).toBe(cause);
  });
});

describe('StackBuildError', () => {
  test('Should_CreateStackBuildError_When_MessageProvided', () => {
    // Arrange
    const message = 'Stack build failed';

    // Act
    const error = new StackBuildError(message);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DeploymentError);
    expect(error).toBeInstanceOf(StackBuildError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('StackBuildError');
    expect(error.stackName).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  test('Should_CreateStackBuildError_When_StackNameProvided', () => {
    // Arrange
    const message = 'Stack build failed';
    const stackName = 'WebStack';

    // Act
    const error = new StackBuildError(message, stackName);

    // Assert
    expect(error.message).toBe(message);
    expect(error.stackName).toBe(stackName);
    expect(error.name).toBe('StackBuildError');
  });
});

describe('ConfigValidationError', () => {
  test('Should_CreateConfigValidationError_When_ValidationErrorsProvided', () => {
    // Arrange
    const message = 'Validation failed';
    const validationErrors = ['repoName is required', 'branch is required'];

    // Act
    const error = new ConfigValidationError(message, validationErrors);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DeploymentError);
    expect(error).toBeInstanceOf(ConfigValidationError);
    expect(error.message).toBe(message);
    expect(error.validationErrors).toEqual(validationErrors);
    expect(error.name).toBe('ConfigValidationError');
  });
});
