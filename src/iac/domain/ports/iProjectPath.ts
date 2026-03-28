export interface IProjectPath {
  getRootPath(): string;

  resolveFullPath(relativePath: string): string;
}
