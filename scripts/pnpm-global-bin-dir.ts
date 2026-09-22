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

/** Prepends the global bin directory to `env.PATH` unless it is already there. */
export function prependGlobalBinDirToPath(env: NodeJS.ProcessEnv): void {
  const globalBinDir = getGlobalBinDir();
  const pathEntries = (env.PATH ?? '').split(path.delimiter);
  if (globalBinDir && !pathEntries.includes(globalBinDir)) {
    env.PATH = env.PATH
      ? `${globalBinDir}${path.delimiter}${env.PATH}`
      : globalBinDir;
  }
}
