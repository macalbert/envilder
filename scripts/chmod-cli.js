#!/usr/bin/env node
/**
 * This script ensures the CLI file has executable permissions on Unix-based systems.
 * It's used as part of the build process.
 */
import { chmod } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');

async function main() {
  try {
    // Only set executable permissions on non-Windows platforms
    if (process.platform !== 'win32') {
      console.log('Setting executable permissions for CLI file...');
      const cliFilePath = join(rootDir, 'lib', 'cli', 'cli.js');
      await chmod(cliFilePath, 0o755); // rwxr-xr-x permissions
      console.log(`Executable permissions set for: ${cliFilePath}`);
    } else {
      console.log('Skipping executable permissions on Windows platform');
    }
  } catch (error) {
    console.error('Error setting executable permissions:', error);
    process.exit(1);
  }
}

main();
