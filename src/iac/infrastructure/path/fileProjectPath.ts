import path from 'node:path';
import type { IProjectPath } from '../../domain/ports/iProjectPath';

export class FileProjectPath implements IProjectPath {
  private readonly rootPath: string;

  constructor(rootPath?: string) {
    this.rootPath = rootPath ?? path.join(process.cwd(), '../../../');
  }

  public getRootPath(): string {
    return this.rootPath;
  }

  public resolveFullPath(projectPath: string): string {
    return path.join(this.rootPath, projectPath);
  }
}
