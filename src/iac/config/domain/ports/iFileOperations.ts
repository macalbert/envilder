/**
 * Interface for file operations
 */
export interface IFileOperations {
  /**
   * Copy a file from source to destination
   * @param source Source file path
   * @param destination Destination file path
   */
  copyFile(source: string, destination: string): void;

  /**
   * Delete a file
   * @param filePath File path to delete
   */
  deleteFile(filePath: string): void;

  /**
   * Check if a file exists
   * @param filePath File path to check
   * @returns True if file exists, false otherwise
   */
  fileExists(filePath: string): boolean;

  /**
   * Read file contents
   * @param filePath File path to read
   * @returns File contents as string
   */
  readFile(filePath: string): string;

  /**
   * Disable Docker Buildx attestations if not already disabled
   */
  disableBuildxAttestations(): void;
}
