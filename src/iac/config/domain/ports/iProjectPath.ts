/**
 * Interface for resolving project paths.
 * This abstraction allows different implementations of path resolution
 * for different project structures.
 */
export interface IProjectPath {
  /**
   * Get the root path of the project/repository
   */
  getRootPath(): string;

  /**
   * Resolve a relative path to a full absolute path
   * @param relativePath Path relative to the repository root
   */
  resolveFullPath(relativePath: string): string;

  /**
   * Generate the Dockerfile destination path from a project path
   * @param projectPath Path to the project containing the Dockerfile
   */
  generateDockerfileDest(projectPath: string): string;
}
