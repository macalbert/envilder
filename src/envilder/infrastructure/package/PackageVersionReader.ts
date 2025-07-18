import { promises as fs } from 'node:fs';

export class PackageVersionReader {
  async getVersion(packageJsonPath: string): Promise<string> {
    try {
      await fs.access(packageJsonPath);
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const pkg: { version?: unknown } = JSON.parse(content);

      if (typeof pkg.version !== 'string') {
        throw new Error('Version field not found in package.json');
      }

      return pkg.version;
    } catch (_err) {
      if (this.isEnoentError(_err)) {
        throw new Error('package.json not found');
      }

      throw new Error(
        `Failed to read or parse package.json: ${_err instanceof Error ? _err.message : String(_err)}`,
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
