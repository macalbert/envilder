import fs from 'node:fs';
import type { IFileOperations } from '../../domain/ports/iFileOperations';
import { FileOperationError } from '../utilities/errors';

/**
 * Service responsible for file operations during deployment
 */
export class FileOperations implements IFileOperations {
  /**
   * Copy a file from source to destination
   * @param source Source file path
   * @param destination Destination file path
   * @throws FileOperationError if copy fails
   */
  copyFile(source: string, destination: string): void {
    try {
      fs.copyFileSync(source, destination);
    } catch (error) {
      throw new FileOperationError(
        `Failed to copy file from ${source} to ${destination}`,
        source,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Delete a file
   * @param filePath File path to delete
   * @throws FileOperationError if deletion fails
   */
  deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      throw new FileOperationError(
        `Failed to delete file ${filePath}`,
        filePath,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Check if a file exists
   * @param filePath File path to check
   * @returns True if file exists, false otherwise
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Read file contents
   * @param filePath File path to read
   * @returns File contents as string
   * @throws FileOperationError if read fails
   */
  readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new FileOperationError(
        `Failed to read file ${filePath}`,
        filePath,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Disable Docker Buildx attestations if not already disabled
   */
  disableBuildxAttestations(): void {
    if (!process.env.BUILDX_NO_DEFAULT_ATTESTATIONS) {
      process.env.BUILDX_NO_DEFAULT_ATTESTATIONS = '1';
    }
  }
}
