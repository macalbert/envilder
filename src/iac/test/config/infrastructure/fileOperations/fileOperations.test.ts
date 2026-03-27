import fs from 'node:fs';
import { FileOperationError } from '../../../../src/config/infrastructure/utilities/errors';
import { FileOperations } from '../../../../src/config/infrastructure/fileOperations/fileOperations';

// Mock fs module
jest.mock('node:fs');

describe('FileOperationsService', () => {
  let fileOpsService: FileOperations;
  let mockFs: jest.Mocked<typeof fs>;

  const originalEnv = process.env;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env.BUILDX_NO_DEFAULT_ATTESTATIONS;

    // Get mocked fs module
    mockFs = fs as jest.Mocked<typeof fs>;

    // Create service instance
    fileOpsService = new FileOperations();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });

  describe('Happy Path Tests', () => {
    test('Should_CopyFileSuccessfully_When_SourceAndDestinationValid', () => {
      // Arrange
      const sourcePath = '/path/to/source.txt';
      const destPath = '/path/to/dest.txt';

      mockFs.copyFileSync = jest.fn();

      // Act
      fileOpsService.copyFile(sourcePath, destPath);

      // Assert
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
      expect(mockFs.copyFileSync).toHaveBeenCalledTimes(1);
    });

    test('Should_DeleteFileSuccessfully_When_FileExists', () => {
      // Arrange
      const filePath = '/path/to/file.txt';

      mockFs.existsSync = jest.fn().mockReturnValue(true);
      mockFs.unlinkSync = jest.fn();

      // Act
      fileOpsService.deleteFile(filePath);

      // Assert
      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(filePath);
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(1);
    });

    test('Should_NotThrowError_When_DeletingNonExistentFile', () => {
      // Arrange
      const filePath = '/path/to/nonexistent.txt';

      mockFs.existsSync = jest.fn().mockReturnValue(false);
      mockFs.unlinkSync = jest.fn();

      // Act
      const action = () => fileOpsService.deleteFile(filePath);

      // Assert
      expect(action).not.toThrow();
      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    test('Should_ReturnTrue_When_FileExists', () => {
      // Arrange
      const filePath = '/path/to/existing.txt';

      mockFs.existsSync = jest.fn().mockReturnValue(true);

      // Act
      const actual = fileOpsService.fileExists(filePath);

      // Assert
      expect(actual).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
    });

    test('Should_ReturnFalse_When_FileDoesNotExist', () => {
      // Arrange
      const filePath = '/path/to/missing.txt';

      mockFs.existsSync = jest.fn().mockReturnValue(false);

      // Act
      const actual = fileOpsService.fileExists(filePath);

      // Assert
      expect(actual).toBe(false);
      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
    });

    test('Should_ReadFileSuccessfully_When_FileExists', () => {
      // Arrange
      const filePath = '/path/to/config.json';
      const fileContent = '{"key": "value"}';

      mockFs.readFileSync = jest.fn().mockReturnValue(fileContent);

      // Act
      const actual = fileOpsService.readFile(filePath);

      // Assert
      expect(actual).toBe(fileContent);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(filePath, 'utf-8');
    });

    test('Should_DisableBuildxAttestations_When_NotAlreadySet', () => {
      // Arrange - env var not set

      // Act
      fileOpsService.disableBuildxAttestations();

      // Assert
      expect(process.env.BUILDX_NO_DEFAULT_ATTESTATIONS).toBe('1');
    });
  });

  describe('Corner Case Tests', () => {
    test('Should_ThrowFileOperationError_When_CopyFails', () => {
      // Arrange
      const sourcePath = '/path/to/source.txt';
      const destPath = '/path/to/dest.txt';
      const copyError = new Error('Permission denied');

      mockFs.copyFileSync = jest.fn().mockImplementation(() => {
        throw copyError;
      });

      // Act
      const action = () => fileOpsService.copyFile(sourcePath, destPath);

      // Assert
      expect(action).toThrow(FileOperationError);
      expect(action).toThrow(
        `Failed to copy file from ${sourcePath} to ${destPath}`,
      );
    });

    test('Should_ThrowFileOperationError_When_DeleteFails', () => {
      // Arrange
      const filePath = '/path/to/locked.txt';
      const deleteError = new Error('File is locked');

      mockFs.existsSync = jest.fn().mockReturnValue(true);
      mockFs.unlinkSync = jest.fn().mockImplementation(() => {
        throw deleteError;
      });

      // Act
      const action = () => fileOpsService.deleteFile(filePath);

      // Assert
      expect(action).toThrow(FileOperationError);
      expect(action).toThrow(`Failed to delete file ${filePath}`);
    });

    test('Should_ThrowFileOperationError_When_ReadFails', () => {
      // Arrange
      const filePath = '/path/to/missing.txt';
      const readError = new Error('ENOENT: no such file or directory');

      mockFs.readFileSync = jest.fn().mockImplementation(() => {
        throw readError;
      });

      // Act
      const action = () => fileOpsService.readFile(filePath);

      // Assert
      expect(action).toThrow(FileOperationError);
      expect(action).toThrow(`Failed to read file ${filePath}`);
    });

    test('Should_NotOverrideEnvVar_When_BuildxAttestationsAlreadySet', () => {
      // Arrange
      process.env.BUILDX_NO_DEFAULT_ATTESTATIONS = '0';

      // Act
      fileOpsService.disableBuildxAttestations();

      // Assert - should not override
      expect(process.env.BUILDX_NO_DEFAULT_ATTESTATIONS).toBe('0');
    });

    test('Should_HandleNonErrorException_When_CopyThrowsNonError', () => {
      // Arrange
      const sourcePath = '/path/to/source.txt';
      const destPath = '/path/to/dest.txt';

      mockFs.copyFileSync = jest.fn().mockImplementation(() => {
        throw 'String error'; // Non-Error exception
      });

      // Act
      const action = () => fileOpsService.copyFile(sourcePath, destPath);

      // Assert
      expect(action).toThrow(FileOperationError);
    });

    test('Should_HandleNonErrorException_When_DeleteThrowsNonError', () => {
      // Arrange
      const filePath = '/path/to/file.txt';

      mockFs.existsSync = jest.fn().mockReturnValue(true);
      mockFs.unlinkSync = jest.fn().mockImplementation(() => {
        throw { message: 'Object error' }; // Non-Error exception
      });

      // Act
      const action = () => fileOpsService.deleteFile(filePath);

      // Assert
      expect(action).toThrow(FileOperationError);
    });

    test('Should_HandleNonErrorException_When_ReadThrowsNonError', () => {
      // Arrange
      const filePath = '/path/to/file.txt';

      mockFs.readFileSync = jest.fn().mockImplementation(() => {
        throw 123; // Non-Error exception
      });

      // Act
      const action = () => fileOpsService.readFile(filePath);

      // Assert
      expect(action).toThrow(FileOperationError);
    });
  });
});
