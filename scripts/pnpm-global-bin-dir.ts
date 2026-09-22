import { execSync } from 'node:child_process';
import path from 'node:path';

/**
 * Resolves pnpm's global bin directory.
 *
 * pnpm 12 moved it to `$PNPM_HOME/bin` and makes `pnpm bin -g` fail when that
 * directory is not on PATH, so a PATH written by an older `pnpm setup` (which
 * only added `$PNPM_HOME`) has to fall back to the derived location.
 */
export function getGlobalBinDir(): string {
  try {
    return execSync('pnpm bin -g', { encoding: 'utf8' }).trim();
  } catch {
    const pnpmHome = process.env.PNPM_HOME;
    if (pnpmHome) {
      return path.join(pnpmHome, 'bin');
    }
    console.warn(
      '⚠️ Could not detect global pnpm bin directory. ' +
        'Set PNPM_HOME if global installs fail.',
    );
    return '';
  }
}

/**
 * Prepends the global bin directory to the PATH entry of `env` unless it is
 * already there.
 *
 * `process.env` resolves keys case-insensitively on Windows, but a spread
 * clone of it is a plain object whose key is usually spelled `Path`. Writing
 * `env.PATH` on such a clone would add a second entry instead of updating the
 * existing one, so the existing key is looked up case-insensitively.
 */
export function prependGlobalBinDirToPath(env: NodeJS.ProcessEnv): void {
  const globalBinDir = getGlobalBinDir();
  if (!globalBinDir) {
    return;
  }
  const pathKey =
    Object.keys(env).find((key) => key.toUpperCase() === 'PATH') ?? 'PATH';
  const currentPath = env[pathKey];
  const pathEntries = (currentPath ?? '').split(path.delimiter);
  if (!pathEntries.includes(globalBinDir)) {
    env[pathKey] = currentPath
      ? `${globalBinDir}${path.delimiter}${currentPath}`
      : globalBinDir;
  }
}
