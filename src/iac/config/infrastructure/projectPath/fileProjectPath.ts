import path from 'node:path';
import type { IProjectPath } from '../../domain/ports/iProjectPath';
import { toKebabCase } from '../utilities/stringUtils';

export class FileProjectPath implements IProjectPath {
  private readonly rootPath: string;

  constructor(rootPath?: string) {
    this.rootPath = rootPath ?? path.join(process.cwd(), '../../../');
  }

  public getRootPath(): string {
    return this.rootPath;
  }

  public generateDockerfileDest(projectPath: string): string {
    const pathSegments = projectPath.split(/[/\\]/);
    const appNameIndex = pathSegments.indexOf('apps') + 1;
    if (appNameIndex === 0 || appNameIndex >= pathSegments.length) {
      throw new Error(
        `Cannot extract app name from project path: ${projectPath}`,
      );
    }
    const appName = pathSegments[appNameIndex];
    return `Dockerfile.${toKebabCase(appName)}`;
  }

  public resolveFullPath(projectPath: string): string {
    return path.join(this.rootPath, projectPath);
  }
}
