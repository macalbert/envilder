import { promises as fs } from 'node:fs';

export class PackageJsonFinder {
  async readPackageJsonVersion(packageJsonPath: string): Promise<string> {
    try {
      await fs.access(packageJsonPath);
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const pkg: { version?: unknown } = JSON.parse(content);

      if (typeof pkg.version !== 'string') {
        throw new Error('Version field not found in package.json');
      }

      return pkg.version;
    } catch (err) {
      if (this.isEnoentError(err)) {
        throw new Error('package.json not found');
      }

      throw new Error(
        `Failed to read or parse package.json: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private isEnoentError(err: unknown): boolean {
    if (!(err instanceof Error)) {
      return false;
    }
    return 'code' in err && (err as { code?: string }).code === 'ENOENT';
  }
}
