import { FileProjectPath } from '../../../../../src/iac/config/infrastructure/projectPath/fileProjectPath';

describe('FileSystemPath', () => {
  describe('constructor', () => {
    test('Should_UseCustomRootPath_When_RootPathProvided', () => {
      // Arrange
      const customPath = '/custom/path';

      // Act
      const config = new FileProjectPath(customPath);

      // Assert
      expect(config.getRootPath()).toBe(customPath);
    });
  });

  describe('getRootPath', () => {
    test('Should_ReturnRootPath_When_Called', () => {
      // Arrange
      const rootPath = '/test/root';
      const config = new FileProjectPath(rootPath);

      // Act
      const result = config.getRootPath();

      // Assert
      expect(result).toBe(rootPath);
    });
  });

  describe('generateDockerfileDest', () => {
    test('Should_GenerateKebabCaseName_When_StandardPathProvided', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src/apps/Minimal.Api/Dockerfile';

      // Act
      const result = config.generateDockerfileDest(projectPath);

      // Assert
      expect(result).toBe('Dockerfile.minimal-api');
    });

    test('Should_ConvertPascalCaseToKebabCase_When_AppNameInPascalCase', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src/apps/WorkerService/Dockerfile';

      // Act
      const result = config.generateDockerfileDest(projectPath);

      // Assert
      expect(result).toBe('Dockerfile.worker-service');
    });

    test('Should_HandleDotSeparators_When_AppNameContainsDots', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src/apps/My.Test.App/Dockerfile';

      // Act
      const result = config.generateDockerfileDest(projectPath);

      // Assert
      expect(result).toBe('Dockerfile.my-test-app');
    });

    test('Should_HandleUnderscores_When_AppNameContainsUnderscores', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src/apps/My_Test_App/Dockerfile';

      // Act
      const result = config.generateDockerfileDest(projectPath);

      // Assert
      expect(result).toBe('Dockerfile.my-test-app');
    });

    test('Should_HandleBackslashes_When_WindowsPathProvided', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src\\apps\\Minimal.Api\\Dockerfile';

      // Act
      const result = config.generateDockerfileDest(projectPath);

      // Assert
      expect(result).toBe('Dockerfile.minimal-api');
    });

    test('Should_ThrowError_When_AppsSegmentNotFound', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src/services/MyService/Dockerfile';

      // Act & Assert
      expect(() => config.generateDockerfileDest(projectPath)).toThrow(
        'Cannot extract app name from project path',
      );
    });

    test('Should_ThrowError_When_AppsSegmentIsLast', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src/apps';

      // Act & Assert
      expect(() => config.generateDockerfileDest(projectPath)).toThrow(
        'Cannot extract app name from project path',
      );
    });

    test('Should_HandleComplexAppName_When_MultipleCapitalLetters', () => {
      // Arrange
      const config = new FileProjectPath('test-repo');
      const projectPath = 'src/apps/APIGatewayService/Dockerfile';

      // Act
      const result = config.generateDockerfileDest(projectPath);

      // Assert
      expect(result).toBe('Dockerfile.apigateway-service');
    });
  });

  describe('resolveFullPath', () => {
    test('Should_ResolveFullPath_When_RelativePathProvided', () => {
      // Arrange
      const rootPath = '/root/path';
      const config = new FileProjectPath(rootPath);
      const projectPath = 'ProjectDir/src/apps/frontend/dist';

      // Act
      const result = config.resolveFullPath(projectPath);
      const normalizedResult = result.replace(/\\/g, '/');

      // Assert
      expect(normalizedResult).toBe(
        '/root/path/ProjectDir/src/apps/frontend/dist',
      );
    });

    test('Should_CombinePathsCorrectly_When_Called', () => {
      // Arrange
      const rootPath = '/custom/root';
      const config = new FileProjectPath(rootPath);
      const projectPath = 'ProjectDir/src/web/dist';

      // Act
      const result = config.resolveFullPath(projectPath);
      const normalizedResult = result.replace(/\\/g, '/');

      // Assert
      expect(normalizedResult).toBe('/custom/root/ProjectDir/src/web/dist');
    });

    test('Should_HandleEmptyProjectPath_When_EmptyStringProvided', () => {
      // Arrange
      const rootPath = '/root';
      const config = new FileProjectPath(rootPath);
      const projectPath = '';

      // Act
      const result = config.resolveFullPath(projectPath);

      // Assert
      expect(result).toBeDefined();
      expect(result.replace(/\\/g, '/')).toBe('/root');
    });
  });
});
