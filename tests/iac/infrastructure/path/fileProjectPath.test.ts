import { FileProjectPath } from '../../../../src/iac/infrastructure/path/fileProjectPath';

describe('FileProjectPath', () => {
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

  describe('resolveFullPath', () => {
    test('Should_ResolveFullPath_When_RelativePathProvided', () => {
      // Arrange
      const rootPath = '/test/root';
      const config = new FileProjectPath(rootPath);

      // Act
      const result = config.resolveFullPath('src/apps/website/dist');

      // Assert
      expect(result).toContain('test');
      expect(result).toContain('root');
      expect(result).toContain('src');
    });
  });
});
