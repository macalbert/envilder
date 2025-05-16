#!/usr/bin/env node
/**
 * Simple script to set executable permissions on the CLI entry point.
 * Only runs the chmod command on Unix-based systems.
 */
import { chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the project root directory
const rootDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const cliFilePath = join(rootDir, 'lib', 'cli', 'cli.js');

// Only run on non-Windows platforms
if (process.platform !== 'win32') {
  chmod(cliFilePath, 0o755)  // rwxr-xr-x permissions
    .then(() => console.log(`✅ Set executable permissions for: ${cliFilePath}`))
    .catch(error => {
      console.error(`❌ Error setting permissions: ${error.message}`);
      process.exit(1);
    });
} else {
  console.log('📋 Skipping executable permissions on Windows platform');
}
