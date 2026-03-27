import {
  DeploymentError,
  FileOperationError,
  EcrAuthError,
  StackBuildError,
  ConfigValidationError,
} from '../../../../../src/iac/config/infrastructure/utilities/errors';

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

  test('Should_StoreFilePath_When_ErrorCreated', () => {
    // Arrange
    const message = 'File operation failed';
    const filePath = 'C:\\Users\\test\\file.json';

    // Act
    const error = new FileOperationError(message, filePath);

    // Assert
    expect(error.filePath).toBe(filePath);
  });
});

describe('EcrAuthError', () => {
  test('Should_CreateEcrAuthError_When_MessageProvided', () => {
    // Arrange
    const message = 'ECR authentication failed';

    // Act
    const error = new EcrAuthError(message);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DeploymentError);
    expect(error).toBeInstanceOf(EcrAuthError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('EcrAuthError');
    expect(error.region).toBeUndefined();
    expect(error.account).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  test('Should_CreateEcrAuthError_When_RegionAndAccountProvided', () => {
    // Arrange
    const message = 'ECR authentication failed';
    const region = 'us-east-1';
    const account = '123456789012';

    // Act
    const error = new EcrAuthError(message, region, account);

    // Assert
    expect(error.message).toBe(message);
    expect(error.region).toBe(region);
    expect(error.account).toBe(account);
    expect(error.name).toBe('EcrAuthError');
    expect(error.cause).toBeUndefined();
  });

  test('Should_CreateEcrAuthError_When_CauseProvided', () => {
    // Arrange
    const message = 'ECR authentication failed';
    const region = 'eu-west-1';
    const account = '987654321098';
    const cause = new Error('AWS CLI not found');

    // Act
    const error = new EcrAuthError(message, region, account, cause);

    // Assert
    expect(error.message).toBe(message);
    expect(error.region).toBe(region);
    expect(error.account).toBe(account);
    expect(error.name).toBe('EcrAuthError');
    expect(error.cause).toBe(cause);
  });

  test('Should_StoreRegionAndAccount_When_Provided', () => {
    // Arrange
    const message = 'Failed to authenticate';
    const region = 'ap-southeast-1';
    const account = '111222333444';

    // Act
    const error = new EcrAuthError(message, region, account);

    // Assert
    expect(error.region).toBe(region);
    expect(error.account).toBe(account);
    expect(error.cause).toBeUndefined();
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
    const message = 'Failed to build stack';
    const stackName = 'BackendStack-Lambda-Api';

    // Act
    const error = new StackBuildError(message, stackName);

    // Assert
    expect(error.message).toBe(message);
    expect(error.stackName).toBe(stackName);
    expect(error.name).toBe('StackBuildError');
    expect(error.cause).toBeUndefined();
  });

  test('Should_CreateStackBuildError_When_CauseProvided', () => {
    // Arrange
    const message = 'Stack synthesis failed';
    const stackName = 'FrontendStack-Website';
    const cause = new Error('Invalid construct');

    // Act
    const error = new StackBuildError(message, stackName, cause);

    // Assert
    expect(error.message).toBe(message);
    expect(error.stackName).toBe(stackName);
    expect(error.name).toBe('StackBuildError');
    expect(error.cause).toBe(cause);
  });

  test('Should_StoreStackName_When_Provided', () => {
    // Arrange
    const message = 'Build error';
    const stackName = 'SharedStack-RDS';

    // Act
    const error = new StackBuildError(message, stackName);

    // Assert
    expect(error.stackName).toBe(stackName);
    expect(error.cause).toBeUndefined();
  });
});

describe('ConfigValidationError', () => {
  test('Should_CreateConfigValidationError_When_MessageAndErrorsProvided', () => {
    // Arrange
    const message = 'Configuration validation failed';
    const validationErrors = ['Field1 is required', 'Field2 is invalid'];

    // Act
    const error = new ConfigValidationError(message, validationErrors);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DeploymentError);
    expect(error).toBeInstanceOf(ConfigValidationError);
    expect(error.message).toBe(message);
    expect(error.validationErrors).toBe(validationErrors);
    expect(error.name).toBe('ConfigValidationError');
    expect(error.cause).toBeUndefined();
  });

  test('Should_StoreValidationErrors_When_ErrorCreated', () => {
    // Arrange
    const message = 'Validation failed with 2 errors';
    const validationErrors = [
      'repoName is required',
      'domain.name is required',
    ];

    // Act
    const error = new ConfigValidationError(message, validationErrors);

    // Assert
    expect(error.validationErrors).toEqual(validationErrors);
    expect(error.validationErrors).toHaveLength(2);
    expect(error.cause).toBeUndefined();
  });

  test('Should_CreateConfigValidationError_When_EmptyErrorsArray', () => {
    // Arrange
    const message = 'No errors';
    const validationErrors: string[] = [];

    // Act
    const error = new ConfigValidationError(message, validationErrors);

    // Assert
    expect(error.validationErrors).toEqual([]);
    expect(error.validationErrors).toHaveLength(0);
    expect(error.cause).toBeUndefined();
  });

  test('Should_CreateConfigValidationError_When_SingleError', () => {
    // Arrange
    const message = 'Validation failed with 1 error';
    const validationErrors = ['repoName is required and cannot be empty'];

    // Act
    const error = new ConfigValidationError(message, validationErrors);

    // Assert
    expect(error.validationErrors).toHaveLength(1);
    expect(error.validationErrors[0]).toBe(
      'repoName is required and cannot be empty',
    );
    expect(error.cause).toBeUndefined();
  });
});
